'use strict';

assert2(cr, 'cr namespace not created');
assert2(cr.behaviors, 'cr.behaviors not created');

/// Behavior class
cr.behaviors.ObservablePoints = function(runtime) {
	this.runtime = runtime;
};

(function (cr, Math, undef) {
	var
		behaviorProto = cr.behaviors.ObservablePoints.prototype,

		// instance attributes names
		ATTRIBUTE_NAME = [
			'_currentValue', // 0
			'_minValue', // 1
			'_maxValue' // 2
		],

		ATTRIBUTE_NAME_EXPRESSION = [
			'current', // 0
			'minimum', // 1
			'maximum' // 2
		],

		CURRENT_VALUE = 0,
		MIN_VALUE = 1,
		MAX_VALUE = 2,
		ANY_VALUE = 3,

		// options of 'Enable Min & Max' property
		BOTH = 0,
		ONLY_MIN = 1,
		ONLY_MAX = 2,
		NONE = 3,

		// options used in some actions
		ACTION_SET = 0,
		ACTION_ADD = 1,
		ACTION_SUBTRACT = 2,
		ACTION_EXPRESSION = [
			'set', // 0
			'add', // 1
			'subtract' // 2
		],

		// options of 'Initial value mode' property
		// AMOUNT = 0,
		PERCENT = 1,

		// undefined
		NULL = undef, // undefined is the real null for me

		// empty function
		emptyFunc = function() {};

	/// Behavior.Type class
	behaviorProto.Type = function(behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	behaviorProto.Type.prototype.onCreate = emptyFunc;

	// Behavior.Instance class
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};

	var instanceProto = behaviorProto.Instance.prototype;

	instanceProto.onCreate = function () {
		var infinity = Infinity;

		this._initialValue = this.properties[0];
		this._initialValueMode = this.properties[1];
		this._minValue = this.properties[2];
		this._maxValue = this.properties[3];
		this._limitMode = this.properties[4];
		this._applyingChangesCounter = 0;
		this._isOnTrigger = false;

		/**BEGIN-PREVIEWONLY**/
		assert2(
			this._minValue < this._maxValue,
			'[Behavior Observable Points] error: the property "Min value" must be less than the property "Max Value"'
		);
		/**END-PREVIEWONLY**/

		switch (this._limitMode) {
			case BOTH:
				break;
			case ONLY_MIN:
				this._maxValue = infinity;
				break;
			case ONLY_MAX:
				this._minValue = -infinity;
				break;
			case NONE:
			default:
				this._minValue = -infinity;
				this._maxValue = infinity;
				break;
		}

		if (this._initialValueMode === PERCENT) {
			/**BEGIN-PREVIEWONLY**/
			assert2(
				this._maxValue !== infinity,
				'[Behavior Observable Points] error: you can not use *Percent* in property "Initial value mode" with "Max value" enabled. Please change the property "Enable min & max" to *Only max* or *Both*.'
			);
			/**END-PREVIEWONLY**/
			this._initialValue = this._maxValue * (cr.clamp(this._initialValue, 0, 100) / 100);
		}

		// set correct initial value
		this._currentValue = cr.clamp(this._initialValue, this._minValue, this._maxValue);
	};

	instanceProto.onDestroy = emptyFunc;
	instanceProto.tick = emptyFunc;

	instanceProto.saveToJSON = function () {
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"cur": this._currentValue,
			"min": this._minValue,
			"max": this._maxValue,
			"acc": this._applyingChangesCounter
		};
	};

	instanceProto.loadFromJSON = function (o) {
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		this._currentValue = o["cur"];
		this._minValue = o["min"];
		this._maxValue = o["max"];
		this._applyingChangesCounter = o["acc"];
	};

	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections) {
		propsections.push({
			'title': this.type.name,
			'properties': [{
				'name': 'Current value',
				'value': this._currentValue
			}, {
				'name': 'Min value',
				'value': this._minValue
			}, {
				'name': 'Max value',
				'value': this._maxValue
			}, {
				'name': 'Applying changes counter',
				'value': this._applyingChangesCounter
			}, {
				'name': 'Last changed value',
				'value': this._changedValue,
				'readonly': true
			}, {
				'name': 'Last trigger value',
				'value': this._triggerValue,
				'readonly': true
			}, {
				'name': 'Last trigger tag',
				'value': this._triggerTag,
				'readonly': true
			}, {
				'name': 'Last trigger attribute',
				'value': ATTRIBUTE_NAME_EXPRESSION[this._triggerAttribute],
				'readonly': true
			}, {
				'name': 'Last trigger action',
				'value': ACTION_EXPRESSION[this._triggerAction],
				'readonly': true
			}]
		});
	};

	var DEBUGGER_ATTRIBUTE_INDEX_BY_NAME = {
			'Current Value': 0,
			'Min Value': 1,
			'Max Value': 2
		},
		DEBUGGER_TAG = 'debug-edit';

	instanceProto.onDebugValueEdited = function (title, propName, propValue) {
		behaviorProto.acts.SetValue(DEBUGGER_ATTRIBUTE_INDEX_BY_NAME[propName], propValue, DEBUGGER_TAG, true);
	};
	/**END-PREVIEWONLY**/

	/// Conditions class
	function Conditions() {}

	var conditionsProto = Conditions.prototype;

	conditionsProto.CompareValue = function (attr, cmp, value) {
		return cr.do_cmp(this[ATTRIBUTE_NAME[attr]], cmp, value);
	};

	conditionsProto.OnValueChange = function (attr) {
		return this._triggerAttribute === attr || attr === ANY_VALUE;
	};

	conditionsProto.OnValueChangeWithTag = function (attr, tag) {
		return (this._triggerAttribute === attr || attr === ANY_VALUE) && cr.equals_nocase(this._triggerTag, tag);
	};

	conditionsProto.IsApplyingChanges = function () {
		return this._applyingChangesCounter === 0;
	};

	conditionsProto.OnSetApplyChanges = function (applying) {
		return (applying === 0 && this._applyingChangesCounter === 1)
			|| (applying === 1 && this._applyingChangesCounter === 0);
	};

	behaviorProto.cnds = new Conditions();

	/// Actions class
	function Actions() {}

	var actionsProto = Actions.prototype;

	function _modValue (attr, value, tag, emit, action) {
		var attr_index = attr,
			attr = ATTRIBUTE_NAME[attr],
			oldValue = this[attr],
			newValue = oldValue,

			YES = 0;

		switch (action) {
			case ACTION_SET:
				newValue = value;
				break;
			case ACTION_ADD:
				newValue += value;
				break;
			case ACTION_SUBTRACT:
				newValue -= value;
				break;
			default:
				break;
		}

		switch (attr_index) {
			case CURRENT_VALUE:
				newValue = cr.clamp(newValue, this._minValue, this._maxValue);
				break;
			case MIN_VALUE:
				newValue = newValue < this._maxValue ? newValue : Math.min(newValue, this._maxValue - 1);
				break;
			case MAX_VALUE:
				newValue = newValue > this._minValue ? newValue : Math.max(newValue, this._minValue + 1);
				break;
			default:
				break;
		}

		// aplly change if this instance is currently "applying changes"
		if (this._applyingChangesCounter === 0) {
			this[attr] = newValue;
			if (attr_index !== CURRENT_VALUE) {
				this._currentValue = cr.clamp(this._currentValue, this._minValue, this._maxValue);
			}
		}

		if (emit === YES) {
			this._changedValue = newValue - oldValue;
			this._triggerValue = value;
			this._triggerTag = tag;
			this._triggerAttribute = attr_index;
			this._triggerAction = action;
			this._isOnTrigger = true;

			this.runtime.trigger(behaviorProto.cnds.OnValueChange, this.inst);
			if (tag.length > 0) {
				this.runtime.trigger(behaviorProto.cnds.OnValueChangeWithTag, this.inst);
			}

			this._isOnTrigger = false;
		}
	};

	actionsProto.SetValue = function (attr, value, tag, emit) {
		_modValue.call(this, attr, value, tag, emit, ACTION_SET);
	};

	actionsProto.AddValue = function (attr, value, tag, emit) {
		_modValue.call(this, attr, value, tag, emit, ACTION_ADD);
	};

	actionsProto.SubtractValue = function (attr, value, tag, emit) {
		_modValue.call(this, attr, value, tag, emit, ACTION_SUBTRACT);
	};

	actionsProto.SetApplyChanges = function (applying) {
		var counter,
			old = this._applyingChangesCounter;

		if (applying === 0) {
			counter = ++this._applyingChangesCounter;
		} else {
			counter = --this._applyingChangesCounter;
			/**BEGIN-PREVIEWONLY**/
			assert2(
				counter >= 0,
				'[Behavior Observable Points] warning: you are using the "Stop applying changes" more than "Start applying changes" in a ' + this.type.name + ' (use the debugger and check the "Applying Changes Counter").'
			);
			/**END-PREVIEWONLY**/
		}

		if ((counter === 0 && (old - 1) === 0) || (counter === 1 && (old + 1) === 1)) {
			this.runtime.trigger(behaviorProto.cnds.OnSetApplyChanges, this.inst);
		}
	};

	behaviorProto.acts = new Actions();

	/// Expressions
	function Expressions() {}

	var expressionsProto = Expressions.prototype;

	expressionsProto.CurrentValue = function (ret) {
		ret.set_float(this._currentValue);
	};

	expressionsProto.MinValue = function (ret) {
		ret.set_float(this._minValue);
	};

	expressionsProto.MaxValue = function (ret) {
		ret.set_float(this._maxValue);
	};

	expressionsProto.ChangedValue = function (ret) {
		/**BEGIN-PREVIEWONLY**/
		assert2(
			this._isOnTrigger,
			'[Behavior Observable Points] error: You can not use the expression "ChangedValue" outside a trigger "On value change"'
		);
		/**END-PREVIEWONLY**/
		ret.set_float(this._changedValue);
	};

	expressionsProto.TriggerValue = function (ret) {
		/**BEGIN-PREVIEWONLY**/
		assert2(
			this._isOnTrigger,
			'[Behavior Observable Points] error: You can not use the expression "TriggerValue" outside a trigger "On value change"'
		);
		/**END-PREVIEWONLY**/
		ret.set_float(this._triggerValue);
	};

	expressionsProto.TriggerTag = function (ret) {
		/**BEGIN-PREVIEWONLY**/
		assert2(
			this._isOnTrigger,
			'[Behavior Observable Points] error: You can not use the expression "TriggerTag" outside a trigger "On value change"'
		);
		/**END-PREVIEWONLY**/
		ret.set_string(this._triggerTag);
	};

	expressionsProto.TriggerAttribute = function (ret) {
		/**BEGIN-PREVIEWONLY**/
		assert2(
			this._isOnTrigger,
			'[Behavior Observable Points] error: You can not use the expression "TriggerAttribute" outside a trigger "On value change"'
		);
		/**END-PREVIEWONLY**/
		ret.set_string(ATTRIBUTE_NAME_EXPRESSION[this._triggerAttribute]);
	};

	expressionsProto.TriggerAction = function (ret) {
		/**BEGIN-PREVIEWONLY**/
		assert2(
			this._isOnTrigger,
			'[Behavior Observable Points] error: You can not use the expression "TriggerAction" outside a trigger "On value change"'
		);
		/**END-PREVIEWONLY**/
		ret.set_string(ACTION_EXPRESSION[this._triggerAction]);
	};

	behaviorProto.exps = new Expressions();
})(cr, Math);
