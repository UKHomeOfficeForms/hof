# Session Timeout Warning Behaviour

## What this does
Makes the content related to the session timeout warning behaviour customisable. This includes the content in the session timeout warning dialog and on the exit page after the user clicks to exit the form from the session timeout warning dialog.

The component should be set in the project's hof.settings.json
```
 "behaviours": [
    "hof/components/session-timeout-warning"
  ]
```

By default,the default content from the hof framework. If you require customised content at a project level, the following variables must be set to true in hof.settings.json

```
 behaviours: [
    require('../').components.sessionTimeoutWarning
  ],
  sessionTimeoutWarningContent: true,
  exitFormContent: true
```

You can then set the content in the project's pages.json

```
"exit": {
  "message": "We have cleared your information to keep it secure. Your information has not been saved."
},
"session-timeout-warning": {
   "dialog-title": "Your application will close soon",
   "dialog-text": "If that happens, your progress will not be saved.",
   "timeout-continue-button": "Stay on this page",
   "dialog-exit-link": "Exit this form"
}
```

To customise the exit page's header and title, you can create an exit.json file and set the content:
```
{
  "header": "You have left this form",
  "title": "You have left this form"
}
```
