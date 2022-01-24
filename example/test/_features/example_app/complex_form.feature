@feature @example_app @complex_form
Feature: Complex Form
  A user should select complex form on the landing page

  Scenario: Complex Form Submission Without Continuing A Saved Form
    Given I start the 'base' application journey
    Then I should be on the 'landing-page' page showing 'Choose one of the options below and press continue.'
    Then I choose 'Complex form'
    Then I continue to the next step
    Then I should be on the 'continue-saved-form' page showing 'Do you want to continue a saved form?'
    Then I choose 'No'
    Then I continue to the next step
    Then I should be on the 'name' page showing 'What is your full name?'
    Then I fill 'name' with 'Jane Doe'
    Then I click the 'Continue' button
    Then I should be on the 'dob' page showing 'What is your date of birth?'
    Then I enter a date of birth for a 30 year old
    Then I click the 'Continue' button
    Then I should be on the 'address' page showing 'What is your address in the UK?'
    Then I fill 'building' with '10 Downing Street'
    Then I fill 'townOrCity' with 'London'
    Then I fill 'postcode' with 'W12 3DE'
    Then I click the 'Continue' button
    Then I should be on the 'checkboxes' page showing 'Where does your money come from each month?'
    Then I select 'Salary' 
    Then I select 'Child Benefit' 
    Then I click the 'Continue' button
    Then I should be on the 'radio' page showing 'What country was the appeal lodged?'
    Then I select 'England and Wales'
    Then I click the 'Continue' button
    Then I should be on the 'country-select' page showing 'What country is your address located?'
    Then I fill 'countrySelect' with 'United'
    Then I select 'United Kingdom'
    Then I click the 'Continue' button
    Then I should be on the 'text-input-area' page showing 'What are the details of your complaint?'
    Then I fill 'complaintDetails' text area with 'I would like to make a complaint'
    Then I click the 'Continue' button
    Then I should be on the 'select' page showing 'What is the appeal stage?'
    Then I select 'appealStages' and '01. First Tier IAC Appeal - In Country Appeals'
    Then I click the 'Continue' button
    Then I should be on the 'confirm' page showing 'Check your answers before submitting your application.'
    Then I click the 'Confirm submission' button
    Then I should see 'Application sent' on the page
    Then I click the 'Start again' button
    Then I should be on the 'landing-page' page showing 'Choose one of the options below and press continue.'
  
  @continue-saved-form 
  Scenario: Complex Form Submission Continuing A Saved Form
    Given I start the 'base' application journey
    Then I should be on the 'landing-page' page showing 'Choose one of the options below and press continue.'
    Then I choose 'Complex form'
    Then I continue to the next step
    Then I should be on the 'continue-saved-form' page showing 'Do you want to continue a saved form?'
    Then I choose 'Yes'
    Then I fill 'savedFormEmail' with 'email@test.com'
    Then I continue to the next step


