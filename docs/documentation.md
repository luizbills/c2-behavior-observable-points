![Plugin Icon](http://127.0.0.1:8080/PluginIcon-64x64.png)
# Observable Points Documentation

## About the attributes

- A Observable Points is a composition of three attributes (or members): *current value*, *minimum value* and *maximum value*.

- The attributes *minimum* and *maximum* values works as limits of the *current value*.

- The attributes *minimum* and *maximum* values can be disabled (Both or just one). The *minimum value* is **``-Infinity``** when disabled and the *maximum value* is **``+Infinity``** when disabled. By default both are enabled with *minimum value* equal to 0 (zero) and *maximum value* equal to 100.

## Conditions

### Compare value

Compare a attribute value.

> E.g.: Maximum Value >= 300

### On value change

`trigger`

Triggered when a attribute value is changed using *any* tag.

### On value change (with tag)

`trigger`

Triggered when a attribute value is changed using a *determined* tag.

> Note: Tags are case insensitive.

### Is applying changes

True when is applying value changes (in any attributte).

## Actions

### Set value

Set a attribute value.

### Add

Add to a attribute value.

### Subtract

Subtract from a attribute value.

### Set applying value changes

Set whether to apply the value changes (in any attribute).

> Note: this action is not a just `boolean/flag`, it is a *counter*. The option "Stop applying changes" of this action increment this counter by 1 and the option "Start applying changes" decrement by 1. If this counter is greater than or equal 1 no changes will be applied, but it yet will be triggered.

> Example: if you used this action as `Stop applying changes` 2 times then you will need to use this action as `Start applying changes` 2 times too for **really restart applying value changes**.

> For more informations: start the **Construct 2 Debugger** and check the property *Applying Changes Counter*.

## Expressions

### `CurrentValue`

`float`

The current value.

### `MinValue`

`float`

The minimum value allowed for the *current value*.

### `MaxValue`

`float`

The maximum value allowed for the *current value*.

### `ChangedValue`

`float`

The value that really has changed in the last change. **Don't use it outside a trigger "On value change"**.

> Example: You use a action `Add` to **add 25** in the **current value** of a Observable Points called *HitPoints* (just a example). The **current value** of the *HitPoints* is 92 and the **maximum value** is 100. After the action, the **current value** will be 100 (because of the maximum limit) and in the trigger emited/fired by this change, the expression `ChangedValue` will returns 8. Result of 100 (new value) minus 92 (old value).

### `TriggerValue`

`float`

The value *used* to the last change. **Don't use it outside a trigger "On value change"**.

> In the example above, the expression `TriggerValue` returns 25.

### `TriggerAttribute`

`string`

The name of last changed attribute. **Don't use it outside a trigger "On value change"**.

> Returns:

> - `"current"` for changes in the *current value*.

> - `"minimum"` for changes in the *minimum value*.

> - `"maximum"` for changes in the *maximum value*.

### `TriggerTag`

`string`

The tag used in the last change. **Don't use it outside a trigger "On value change"**.

> Returns `""` (empty string) when the tag is not used in the action.

### `TriggerAction`

`string`

The name of the action used to the last change. **Don't use it outside a trigger "On value change"**.

> Returns: `"set"`, `"add"` or `"subtract"`.

## IDE/Editor Properties

### Initial value

The initial value of the attribute *Current value*. Default is 100.

### Initial value mode

If selected **Amount** (default) the *current value* will start with the value in the property **Initial value**.

If selected **Percent** the *current value* will start with a percentage (0 to 100) of the property **Max value**.

### Min value

The value of the attribute *Minimum value*. Default is 0 (zero).

### Max value

The value of the attribute *Maximum value*. Default is 100 (zero).

### Enable min & max

If selected **Both** (default) the attributes *minimum value* and *maximum value* will be started with the values of properties **Min value** and **Max value**.

If selected **Only Min** the attribute *minimum value* will be started with the value of property **Min value** and the *maximum value* will be **``+Infinity``** (ignoring the property **Max value**).

If selected **Only Max** the attribute *maximum value* will be started with the value of property **Max value** and the *minimum value* will be **``-Infinity``** (ignoring the property **Min value**).

If selected **None** the attribute *minimum value* will be started with **``-Infinity``** and the attribute *maximum value* will be started with **`+Infinity`**.

#### Important notes

- **Min Value** must be less than **Max value**.

- The option *Percent* of **Initial value mode** can't be used with **Max value** *disabled*.

## Debug

- In the **Debugger** you can edit the values of [**current value**](#-currentvalue-), [**minimum value**](#-minvalue-), [**maximum value**](#-maxvalue-), [**applying changes counter**](#set-applying-changes) and check out the values of [**last changed value**](#-changedvalue-), [**last trigger value**](#-triggervalue-), [**last trigger tag**](#-triggertag-), [**last trigger attribute**](#-triggerattribute-) and [**last trigger action**](#-triggeraction-).

- Attributes edited in the debugger emits/fires a trigger "on value change" with the tag `"debug_edit"`.

## Save/load

- This behavior is compatible with Save/load. See [here](https://www.scirra.com/tutorials/526/how-to-make-savegames) to learn how to save games.
