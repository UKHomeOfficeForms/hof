#### Table Component

The `tableComponent` macro can be used to display a table on a page. It takes one parameter:

  - `tableName`: An object containing the following keys:
    - `headers` : an array with the text for each table header
    - `rows`: an array of arrays with the text for each table row
    - `caption`: the table caption (Optional)
    - `firstCellIsHeader`: if set to true, it puts the first element of the each array in the rows array in bold (Optional)
  
**Example usage:**

Set your table object in the relevant `.json` file:
```
"test_table": {
  "headers": [
    "Name",
    "Purpose",
    "Expires"
  ],
  "rows": [
    [
      "seen_cookie_message",
      "Lets us know you’ve already seen our cookie message",
      "1 month"
    ],
    [
      "cookie_preferences",
      "Lets us know that you’ve saved your cookie consent settings",
      "1 month"
    ]
  ],
  "caption": "Table caption" // optional
  "firstCellIsHeader": true // optional
}
```
In your view file:
```
{% from "partials/table.html" import tableComponent %}

{{ tableComponent(test_table) }}

```
