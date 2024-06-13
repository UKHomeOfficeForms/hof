# HOF code review checklist v1.0

This is a general guide on what you should check for when reviewing another team member's code.
 
## Fundamental checks
- [ ] Check for code format
- [ ] Check for duplicate code
- [ ] Check for if there are existing components in the framework already
- [ ] Check for copy and paste
- [ ] Check code readability (if the class, function and variable names are making sense, avoid using acronyms, check for simplicity, avoid complexity)
- [ ] Check if user inputs are sanitized
- [ ] Check if errors are handled
- [ ] Check if null / undefined values are checked before actions are performed on a variable (May not always be necessary)
- [ ] Check for performance (are there logic in loops that doesn't have to be executed each time? Could some tasks be added to a queue and performed later? etc)

## Advanced (optional if the ticket is low / medium impact) checks
- [ ] Check if the code is following SOLID principle, code maintainability 
- [ ] Check if none functional requirements are needed (for example, should an audit log be stored for an action performed)
- [ ] Check the performance and efficiency of the tests
- [ ] Check to avoid the use of operations that only work in javascript (e.g. using && to return the object on the right if the statement on the left is true)


