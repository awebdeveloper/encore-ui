[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# Directives 
This component provides directives and styles for putting status columns into tables.

## rx-status-header

For the `<th>` component representing the status column, add the `rx-status-header` attribute, i.e.

    <th rx-status-header></th>

Note that status columns are sortable with <a href="#/component/rxSortableColumn">rxSortableColumn</a>, just like any other column. The demo below shows an example of this.

One few things to note about the demo: The <code>&lt;th&gt;<code> is defined as:
<pre><code>
        &lt;th rx-status-header&gt;
            &lt;rx-sortable-column
              sort-method="sortCol(property)"
              sort-property="status"
              predicate="sort.predicate"
              reverse="sort.reverse">
                Status
            &lt;/rx-sortable-column&gt;
        &lt;th&gt;
</code></pre>

In particular, note that the word <code>Status</code> is used as the content of the <code>&lt;rx-sortable-column&gt;</code> directive, but this word doesn't actually appear in the header of the status column. This is because of a bug in <code>rxSortableColumn</code> that we will fix later. We purposely do not want the word to appear in that column, but we require <em>something</em> to be there, otherwise the column header is not clickable.

Also note that <code>sort-property="status"</code> is referring to the <code>server.status</code> property on each row. Thus the sorting is done in this example by the status text coming from the API.

## rx-status-column

For the corresponding `<td>`, you will need to add the `rx-status-column` attribute, and set the `status` attribute appropriately. You can optionally set `api` and `tooltip-content` attributes. `tooltip-content` sets the tooltip that will be used. If not set, it will default to the value you passed in for `status`. The `api` attribute will be explained below.

We currently support five statuses, with corresponding CSS styles. Namely, `"ACTIVE"`, `"WARNING"`, `"ERROR"`, `"INFO"` and `"PENDING"`. If your code happens to already use those statuses, then you can simply pass them to the `status` attribute as appropriate. However, it's likely that internally you will be receiving a number of different statuses from your APIs, and will need to map them to these five statuses.

The example in the demo shows a typical use of this directive, such as:

    <tbody>
        <tr ng-repeat="server in servers">
            <!-- Both `api` and `tooltip-content` are optional -->
            <td rx-status-column status="{{ server.status }}" api="{{ server.api }}" tooltip-content="{{ server.status }}"></td>
            <td>{{ server.title }}</td>
            <td>{{ server.value }}</td>
        </tr>
    </tbody>


# A note about color usage for rxStatusColumn

Encore uses the color red for destructive and "delete" actions, and the color green for additive or "create" actions, and at first it may seem that the styles of rxStatusColumn do not follow that same logic. However, the distinction here is that when an action or status on an item is "in progress" or "pending" (i.e. the user cannot take any additional action on that item until a transition completes), it is given the yellow animated `PENDING` treatment. This is true even for "create"/"add" actions or "delete" actions. A general rule of thumb to follow is that if a status ends in -`ING`, it should get the animated yellow stripes of `PENDING`.


# Defining mappings

To accommodate different statuses, the `rxStatusMappings` factory includes methods for defining mappings from your own statuses to the five defined ones. The basic methods for this are `rxStatusMappings.addGlobal()` and `rxStatusMappings.addAPI()`.

## addGlobal()

`rxStatusMappings.addGlobal()` takes an object as an argument, with the keys being your own product's statuses, and the values being one of the five internal statuses that it should map to. For example:

    rxStatusMappings.addGlobal({
        'RUNNING': 'ACTIVE',
        'STANDBY': 'INFO',
        'SUSPENDED': 'WARNING',
        'FAILURE': 'ERROR'
    })

These mappings will be used throughout all instances of `rx-status-column` in your code. 

## addAPI()

Say that you are using three APIs in your product, `X`, `Y` and `Z`. Both `X` and `Y` define a status `"FOO"`, which you want to map to encore-ui's `"WARNING"`. You can declare this  mapping with `rxStatusMappings.addGlobal({ 'FOO': 'WARNING' })`. But your API `Z` also returns a `"FOO"` status, which you need mapped to encore-ui's `"ERROR"` status. 

You _could_ do a transformation in your product to convert the `"FOO"` from `Z` into something else, or you can make use of `rxStatusMappings.addAPI()`, as follows:

    rxStatusMappings.addAPI('z', { 'FOO': 'ERROR' })

Then in your template code, you would use `rx-status-column` as:

    <td rx-status-column status="{{ status }}" api="z">

This will tell encore-ui that it should first check if the passed in `status` was defined separately for an api `"z"`, and if so, to use that mapping. If `status` can't be found in the mappings defined for `"z"`, then it will fall back to the mappings you defined in your `.addGlobal()` call.

## mapToActive()/mapToWarning()/mapToError()/mapToInfo()/mapToPending()

While `.addGlobal()` and `.addAPI()` would be sufficient on their own, they can be slightly cumbersome. If you have a list of statuses that all need to get mapped to the same encore-ui status, the mapping object will be forced to have repetition, leaving room for errors. For example, something like this:

    rxStatusMappings.addGlobal({
        'BLOCKED': 'ERROR',
        'SHUTDOWN': 'ERROR',
        'FAILED': 'ERROR'
    });

There is required repetition of `"ERROR"` in each pair, and there's always the chance of misspelling `"ERROR"`. Instead, we provide a utility method `mapToError` to help with this:

    rxStatusMappings.mapToError(['BLOCKED', 'SHUTDOWN', 'FAILED']);

This has the advantage that it's shorter to type, eliminates the chance of mistyping or misassigning `"ERROR"`, and keeps all `"ERROR"` mappings physically grouped. With this, you could easily keep your mapping values in an Angular `.value` or `.constant`, and just pass them to these methods in your `.run()` method.

There are equivalent `mapToWarning`, `mapToActive`, `mapToPending` and `mapToInfo` methods.

All five of these methods can take an array or a single string as the first argument. The call above is equivalent to this group of individual calls:

    rxStatusMappings.mapToError('BLOCKED');
    rxStatusMappings.mapToError('SHUTDOWN');
    rxStatusMappings.mapToError('FAILED');

All five can also take `api` as a second, optional parameter. Thus we could define the `rxStatusMappings.addAPI({ 'FOO': 'ERROR' }, 'z')` example from above as:

    rxStatusMappings.mapToError('FOO', 'z');


## getInternalMapping()

`rxStatusMappings` defines a `getInternalMapping(statusString, api)` method, which the framework uses to map a provided `status` string based on the mapping rules from all the methods above. It's intended for internal use, but there's nothing stopping you from using it if you find a need.

If you ask it to map a string that is not registered for a mapping, it will return back that same string.
