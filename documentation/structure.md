# Structure

For a small-scale application with a single journey it's reasonable to put the components in the root of the project;

## Basic

```
my_hof_app
│
├───wizard/
│
├───translations/
│
├───views/
│
├───controllers/
│
├───fields/
│
├───steps.js
│
└───index.js

```

However, as the application grows in size, it makes sense to add some structure. We advocate a structure that separates and compartmentalises the project based on the concept of "apps" or journeys.

## Compartmentalised

The following example shows an "apps" directory containing two journeys and a directory called "common" that we use for any shared components.

```
my_hof_app
│
└───apps/
    │
    ├───common/
    │   │
    │   ├───translations/
    │   │
    │   ├───controllers/
    │   │
    │   ├───views/
    │   │
    │   └───fields/
    │
    ├───journey-one/
    │   │
    │   ├───translations/
    │   │
    │   ├───controllers/
    │   │
    │   ├───views/
    │   │
    │   ├───fields/
    │   │
    │   ├───steps.js
    │   │
    │   └───index.js
    │
    └───journey-two/
        │
        └───...
```

In the preceding example each journey contains the components related to that specific journey, with the exception of any shared resources - which exist in common.

The entry point for each journey is `index.js`, which is where the set up for each HOF wizard and application route exists.
