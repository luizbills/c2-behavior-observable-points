function GetBehaviorSettings() {
	return {
		"name":			"Observable Points",
		"id":			"ObservablePoints",
		"version":		"0.1",
		"description":	"A behavior that stores float values and trigger events when they changes.",
		"author":		"Luiz P. \"Bills\"",
		"help url":		"https://www.github.com/luizbills/c2-behavior-observable-points",
		"category":		"General",
		"flags":		0
	};
};

/// Conditions
var uid = 0;

AddComboParamOption("Current value");
AddComboParamOption("Min value");
AddComboParamOption("Max value");
AddComboParam("Attribute", "the attribute to test.");
AddCmpParam("Comparison", "Choose the way to compare the attribute value.");
AddNumberParam("Value", "The another value to compare the attribute value to.");
AddCondition(uid++, cf_none, "Compare value", "", "<i>{0}</i> of {my} {1} <i>{2}</i>", "Compare a attribute value of this observable points.", "CompareValue");

AddComboParamOption("Current value");
AddComboParamOption("Min value");
AddComboParamOption("Max value");
AddComboParam("Attribute", "the attribute to observe changes.");
AddCondition(uid++, cf_trigger, "On value change", "", "On {my} <b>{0}</b> changed", "Triggered when a attribute value of this observable points is changed using any tag.", "OnValueChange");

AddComboParamOption("Current value");
AddComboParamOption("Min value");
AddComboParamOption("Max value");
AddComboParam("Attribute", "the attribute to observe changes.");
AddStringParam("Tag", "Enter the name this change.");
AddCondition(uid++, cf_trigger, "On value change (with tag)", "", "On {my} <b>{0}</b> changed (tag: <i>{1}</i>)", "Triggered when a attribute value is changed using a determined tag.", "OnValueChangeWithTag");

AddCondition(uid++, cf_none, "Is applying value changes", "", "{my} is applying changes", "True when is applying value changes (in any attributte).", "IsApplyingChanges");

AddComboParamOption("stop applying");
AddComboParamOption("start applying");
AddComboParam("Value changes", "Set when will trigger.");
AddCondition(uid++, cf_trigger, "On set applying value changes", "", "On {0} {my} value changes", "Triggered this observable points start or stop applying value changes.", "OnSetApplyChanges");

/// Actions
uid = 0;

AddComboParamOption("Current value");
AddComboParamOption("Min value");
AddComboParamOption("Max value");
AddComboParam("Attribute", "the attribute to observe changes.");
AddNumberParam("Value", "The new value to set");
AddStringParam("Tag", "Enter a name to identify this change. (optional)");
AddComboParamOption("yes");
AddComboParamOption("no");
AddComboParam("Trigger this change", "Emit or not a trigger to this change.");
AddAction(uid++, 0, "Set value", "", "Set {my} <b>{0}</b> to <i>{1}</i> (tag: <i>{2}</i>, trigger: <i>{3}</i>)", "Set a attribute value of this observable points.", "SetValue");

AddComboParamOption("Current value");
AddComboParamOption("Min value");
AddComboParamOption("Max value");
AddComboParam("Attribute", "the attribute to observe changes.");
AddNumberParam("Value", "The value to add");
AddStringParam("Tag", "Enter a name to identify this change. (optional)");
AddComboParamOption("yes");
AddComboParamOption("no");
AddComboParam("Trigger this change", "Emit or not a trigger to this change.");
AddAction(uid++, 0, "Add", "", "Add <i>{1}</i> to {my} <b>{0}</b> (tag: <i>{2}</i>, trigger: <i>{3}</i>)", "Add to a attribute value of this observable points.", "AddValue");

AddComboParamOption("Current value");
AddComboParamOption("Min value");
AddComboParamOption("Max value");
AddComboParam("Attribute", "the attribute to observe changes.");
AddNumberParam("Value", "The value to subtract");
AddStringParam("Tag", "Enter a name to identify this change. (optional)");
AddComboParamOption("yes");
AddComboParamOption("no");
AddComboParam("Trigger this change", "Emit or not a trigger to this change.");
AddAction(uid++, 0, "Subtract", "", "Subtract <i>{1}</i> from {my} <b>{0}</b> (tag: <i>{2}</i>, trigger: <i>{3}</i>)", "Subtract from a attribute value of this observable points.", "SubtractValue");

AddComboParamOption("Stop applying");
AddComboParamOption("Start applying");
AddComboParam("Value changes", "Set whether to apply the any value changes.");
AddAction(uid++, 0, "Set applying value changes", "", "{0} {my} value changes", "Set whether to apply the value changes of this observable points.", "SetApplyChanges");

/// Expressions
uid = 0;

AddExpression(uid++, ef_return_number, "Current value", "", "CurrentValue", "The current value of this observable points.");

AddExpression(uid++, ef_return_number, "Minimum value", "", "MinValue", "The minimum value of this observable points.");

AddExpression(uid++, ef_return_number, "Maximum value", "", "MaxValue", "The maximum value of this observable points.");

AddExpression(uid++, ef_return_number, "Changed value", "", "ChangedValue", "The value of the last change in this observable points.");

AddExpression(uid++, ef_return_number, "Trigger value", "", "TriggerValue", "The value used to the last change in this observable points (without clamp this value if min or max values are enabled).");

AddExpression(uid++, ef_return_string, "Trigger attribute", "", "TriggerAttribute", "The name of last changed attribute of this observable points.");

AddExpression(uid++, ef_return_string, "Trigger tag", "", "TriggerTag", "The tag of the last change in this observable points.");

AddExpression(uid++, ef_return_string, "Trigger action", "", "TriggerAction", "The name of action used to make the last change in this observable points.");

ACESDone();

/// Array of property grid properties for this plugin
var property_list = [
	new cr.Property(ept_float, "Initial value", 100, "The initial value."),
	new cr.Property(ept_combo, "Initial value mode", "Amount", "requires 'Enable max value' enabled", "Amount|Percent"),
	new cr.Property(ept_float, "Min value", 0, "The minimum value."),
	new cr.Property(ept_float, "Max value", 100, "The maximum value."),
	new cr.Property(ept_combo, "Enable min & max", "Both", "Used to enable/disable the minimum value or/and maximum value.", "Both|Only min|Only max|None"),
];

function CreateIDEBehaviorType() {
	return new IDEBehaviorType();
}

function IDEBehaviorType() {
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

IDEBehaviorType.prototype.CreateInstance = function(instance) {
	return new IDEInstance(instance, this);
}

function IDEInstance(instance, type) {
	assert2(this instanceof arguments.callee, "Constructor called as a function");

	this.instance = instance;
	this.type = type;
	this.properties = {};

	for (var i = 0; i < property_list.length; i++) {
		this.properties[property_list[i].name] = property_list[i].initial_value;
	}
}

IDEInstance.prototype.OnCreate = function() {}

IDEInstance.prototype.OnPropertyChanged = function(property_name) {}
