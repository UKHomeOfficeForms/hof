# Clear Session Behaviour

## What this does
Resets the HOF session model `req.sessionModel.reset()` and clears anything stored by Redis when a user has submitted their information. This behaviour can be used on the final/penultimate step in a flow to ensure proper session clearing.

## Additional information

In your fields file the clear session behaviour can be brought in like this.

```
'/confirm': {
  behaviour: require('hof').components.clearSession
}
```
On your server.js file if you set res.locals to have a confirm step set:
```
app.use((req, res, next) => {
  res.locals.confirmStep = '/confirm';
  next();
});
```
Then the confirm behaviour will also ensure to reset options on your confirm step for 'uploadPdfShared' and 'submitted' back to false if using these options to keep track of the generation and submission of pdf files. The default configuration for your confirm step might looks like this:
```
'/confirm': {
  behaviour: [SubmitPDFBehaviour, require('hof').components.clearSession],
  uploadPdfShared: false,
  submitted: false
}
```
where a SubmitPDFBehaviour is run first which updates the 'uploadPdfShared' and 'submitted' options on the confirm step to true. This clear session behaviour will ensure those are reset along with clearing the session model.
