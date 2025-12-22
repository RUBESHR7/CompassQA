export const SAMPLE_CSV = `Test Case ID,Feature,Scenario,Step Description,Test Data,Expected Result
AMCC-TC-110,Access Management,Verify Admin can create Access Item,Login to the application as <role>,Admin,User is logged in
,,Navigate to Administration > Access Management,,,"Page Title is 'Access Management'"
,,Click on "Create Access Item",,,"'Create Access Item' page is displayed"
,,Enter valid Access ID,auto_test_id,,Field accepts value
,,Enter valid Name,Auto Test Name,,Field accepts value
,,Select Type,Link,,Dropdown selected
,,Click Save,,,"Success message 'Access created successfully' is displayed"`;

export const SAMPLE_FEATURE = `Feature: Access Management

  Scenario Outline: Verify Admin can create Access Item
    Given Login to the application as '<role>'
    When Navigate to Administration > Access Management
    Then Page Title is 'Access Management'
    When Click on "Create Access Item"
    Then 'Create Access Item' page is displayed
    When Enter valid Access ID '<accessId>'
    And Enter valid Name '<accessName>'
    And Select Type '<accessTypeValue>'
    And Click Save
    Then Success message '<successMsg>' is displayed

    Examples:
      | role  | accessId      | accessName     | accessTypeValue | successMsg                  |
      | Admin | auto_test_id  | Auto Test Name | Link            | Access created successfully |`;

export const SAMPLE_JSON = `{
    "test": {
        "generic": {
            "accessManagement": "Access Item Management",
            "administration": "Administration",
            "createAccessItem": "Create Access Item",
            "successMsg": "Access created successfully.",
            "editAccessItem": "Edit Access Item",
            "yes": "Discard Changes",
            "no": "Continue Editing",
            "options": [
                "Discard Changes",
                "Continue Editing"
            ]
        },
        "AMCC-TC-345": {
            "pageTitle": "Access Management",
            "searchName": "order access management system",
            "verifyMsg": "No Results Found."
        },
        "AMCC-TC-1237": {
            "inputData": {
                "accessId": "AUTO_AMC_QATEST_A",
                "accessName": "AMC_QATESTNAME_A",
                "accessTypeValue": "DASHBOARD",
                "accessParent": "HDN_MENU",
                "accessOrder": "1",
                "accessBasedOn": "Primary User"
            }
        },
        "AMCC-TC-110": {
            "inputData": {
                "active": "Active",
                "accessId": "AUTO_AMC_QATEST_A110",
                "accessName": "AMC_QATESTNAME_A",
                "accessTypeValue": "LINK"
            }
        },
        "AMCC-TC-384": {
            "role": "ADMIN - Task Mgmt (50)",
            "accessClass": "ADMIN",
            "inputData": {
                "accessId": "AUTO_AMC_QATEST_A384",
                "accessName": "AUTO_AMC_QATESTNAME_A384"
            }
        }
    }
}`;

export const STEP_DEF_PROMPT = `
Generate Selenium Python step definitions.
Use 'context' for data sharing.
Follow Page Object Model if implied.
`;

export const SAMPLE_FEATURE_REF = `Feature: AMCC-84 Add or Edit Navigation Path
@regression @access-management @amcc-84 @amcc-tc - 304
  Scenario Outline: AMCC - TC - 304 Verify "Add Navigation Path" button is enabled for users with both Read and Edit access
    Given Login to the Cold Compass application with valid credentials
    When Navigate to Administration -> Access Item Management Tab
    Then Access Management Page should be displayed '<accessManagement>'
    When Click on the Create Access Item button
    Then Create new access item page should be displayed '<createNewAccessItem>'
    When Enter '<inputData>' in the respective fields
    Then Verify Active Toggle is enabled
    When Click the Submit button
    Then User should be redirected to the Access Item Details Page and Access Created Successfully message should be displayed '<successMsg>'
    Then Verify that the Add Navigation Path button is enabled
Examples:
| accessManagement | createNewAccessItem | inputData | successMsg |
| generic | generic | AMCC - TC - 304 | generic |

    @regression @access - management @amcc-84 @amcc-tc - 302
  Scenario Outline: AMCC - TC - 302 Verify user can delete a navigation path
    Given Login to the Cold Compass application with valid credentials
    When Navigate to Administration -> Access Item Management Tab
    Then Access Management Page should be displayed '<accessManagement>'
    When Click on the Create Access Item button
    Then Create new access item page should be displayed '<createNewAccessItem>'
    When Enter '<inputData>' in the respective fields
    Then Verify Active Toggle is enabled
    When Click the Submit button
    Then User should be redirected to the Access Item Details Page and Access Created Successfully message should be displayed '<successMsg>'
    When Click on the Add Navigation Path button and should be visible
    Then Add Navigation Path flyer page should be displayed '<addNavigationPath>'
    When Enter '<inputData>' in add navigation path
    Then Verify that the Add Navigation Path button is enabled
    And Click the save button
    Then The Navigation path should be saved successfully
    When Click on the Remove Navigation Path button
    Then Verify that the navigation path is removed and the Add Navigation Path button is displayed
Examples:
| accessManagement | createNewAccessItem | inputData | successMsg | addNavigationPath |
| generic | generic | AMCC - TC - 302 | generic | generic |
`;

export const SAMPLE_STEP_DEF_REF = `# pylint: disable =import -error
import pytest
    from pytest_bdd import given, parsers, scenarios, then, when
from business_components.web_components.accessItemManagement import(
        enter_access_item_details,
    )
from business_components.web_components.login import login_to_application_sso
    from object_repository.pages.Administration.AccessItem.AccessItemDetailsPage import(
        AccessItemDetailsPage,
    )
from object_repository.pages.Administration.AccessItem.AccessItemLandingPage import(
        AccessItemLandingPage,
    )
from object_repository.pages.HomePage import HomePage
    from utilities.genericUtils import CustomPyAutoWeb
    from utilities.helper import generate_random_number, load_test_data_from_json

random_number = generate_random_number()
# Load the feature file
scenarios("../../features/accessManagement/addOrEditNavigationPath.feature")
json_data = load_test_data_from_json("../../testData/accessManagement.json")

@given("Login to the Cold Compass application with valid credentials")
def login_to_application(bdd_driver):
login_to_application_sso(bdd_driver)
print("Logged in successfully")

@when("Navigate to Administration -> Access Item Management Tab")
def navigate_to_access_item_management(bdd_driver):
CustomPyAutoWeb(bdd_driver).click_wait_locator(
    locatorList = HomePage.locatorAdministrationBtn
)
CustomPyAutoWeb(bdd_driver).click_wait_locator(
    locatorList = HomePage.locatorAccessItemBtn
)

@then("Access Management Page should be displayed '<accessManagement>'")
@pytest.mark.parametrize("accessManagement", json_data.keys())
def verify_access_management_page(bdd_driver, accessManagement):
test_data = json_data.get(accessManagement, {})
CustomPyAutoWeb(bdd_driver).element_text_should_be(
    web_element = AccessItemLandingPage.locatorAccessItemTitle,
    expected_string = test_data["accessManagement"],
)

@when("Click on the Create Access Item button")
def click_create_access_item(bdd_driver):
CustomPyAutoWeb(bdd_driver).click_wait_locator(
    locatorList = AccessItemLandingPage.locatorCreateAccessItem
)

@then("Create new access item page should be displayed '<createNewAccessItem>'")
@pytest.mark.parametrize("createNewAccessItem", json_data.keys())
def verify_create_access_item_page(bdd_driver, createNewAccessItem):
test_data = json_data.get(createNewAccessItem, {})
CustomPyAutoWeb(bdd_driver).element_text_should_be(
    web_element = AccessItemLandingPage.locatorCreateAccessItemTitle,
    expected_string = test_data["createNewAccessItem"],
)

@when("Enter '<inputData>' in the respective fields")
@pytest.mark.parametrize("inputData", json_data.keys())
def enter_access_item(bdd_driver, inputData):
test_data = json_data.get(inputData, {})
enter_access_item_details(
    driver = bdd_driver, inputData = test_data["inputData"], random_number = random_number
)

@then("Verify Active Toggle is enabled")
def verify_active_toggle(bdd_driver):
CustomPyAutoWeb(bdd_driver).element_should_be_enabled(
    locatorList = AccessItemLandingPage.locatorActiveToggle
)

@then("Add Navigation Path flyer should open with '<addNavigationPath>'")
@pytest.mark.parametrize("addNavigationPath", json_data.keys())
def verify_edit_nav_flyer(bdd_driver, addNavigationPath):
test_data = json_data.get(addNavigationPath, {})
CustomPyAutoWeb(bdd_driver).element_text_should_be(
    web_element = AccessItemDetailsPage.locatorAccessEditNavTitle,
    expected_string = test_data["addNavigationPath"],
)
    `;
