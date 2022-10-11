# Combine & Loop Fields Behaviour

## What this does
This allows you to specify fields to loop over and add as objects to a parent array. You can use this for adding multiple addresses, criminal offences, names etc. You can see here in this example, we ask for a set of details prefixed with the word `storage-` for getting address details for multiple storage addresses (see the Home Office's firearms repository). We then can aggregate these addresses as objects into an array called `all-storage-addresses` and get redirected back to `/add-address` whenever we selected `yes` to adding another address,
```
'/add-address': {
  fields: [
    'storage-building',
    'storage-street',
    'storage-townOrCity',
    'storage-postcodeOrZIPCode'
  ],
  next: '/add-another-address-with-list',
  continueOnEdit: true
},
'/add-another-address-with-list': {
  template: 'add-another-address-loop.html',
  behaviours: CombineAndLoopFields({
    groupName: 'all-storage-addresses',
    fieldsToGroup: [
      'storage-building',
      'storage-street',
      'storage-townOrCity',
      'storage-postcodeOrZIPCode'
    ],
    removePrefix: 'storage-',
    combineValuesToSingleField: 'address',
    groupOptional: true,
    returnTo: '/add-address'
  }),
  next: '/confirm'
```
Here are the fields you call this behaviour first to set config for it:
```
`groupName`: (Required) a parent array for storing details for each object you are collecting information for,
`fieldsToGroup`: (Required) the fields being specified for an object, e.g. house number, street, postcode, that are grouped together,
`removePrefix`: (Optional) a string which is used to remove consistent prefixes from a collection of fields that are grouped together,
`combineValuesToSingleField`: (Optional) a new field that is created with its value being the concatenation of values of the fields specified in `fieldsToGroup`,
`groupOptional`: (Optional) set this to true if you want to land on the radio button question if all records in the group are deleted after creation,
`returnTo`: (Required) the next step if you want to add another object to this group
```
