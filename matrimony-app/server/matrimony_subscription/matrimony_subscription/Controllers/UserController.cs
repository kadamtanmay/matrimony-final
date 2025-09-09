using Microsoft.AspNetCore.Mvc;
using matrimony_subscription.Services;

namespace matrimony_subscription.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserColumn(long userId, [FromQuery] string columnName, [FromQuery] string newValue)
        {
            try
            {
                // Input validation
                if (string.IsNullOrWhiteSpace(columnName))
                {
                    return BadRequest(new { message = "Column name is required." });
                }

                if (string.IsNullOrWhiteSpace(newValue))
                {
                    return BadRequest(new { message = "New value is required." });
                }

                if (userId <= 0)
                {
                    return BadRequest(new { message = "Invalid user ID." });
                }

                var success = await _userService.UpdateUserColumnAsync(userId, columnName, newValue);
                
                if (success)
                {
                    return Ok(new { 
                        message = "User updated successfully.", 
                        userId = userId, 
                        columnName = columnName, 
                        newValue = newValue 
                    });
                }
                else
                {
                    return NotFound(new { message = "User not found or update failed." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the user.", error = ex.Message });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(long userId)
        {
            try
            {
                if (userId <= 0)
                {
                    return BadRequest(new { message = "Invalid user ID." });
                }

                var user = await _userService.GetUserByIdAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                // Return user data with proper field mapping
                var userResponse = new
                {
                    id = user.Id,
                    first_name = user.FirstName,
                    last_name = user.LastName,
                    email = user.Email,
                    gender = user.Gender,
                    date_of_birth = user.DateOfBirth,
                    phone = user.Phone,
                    address = user.Address,
                    marital_status = user.MaritalStatus,
                    religion = user.Religion,
                    caste = user.Caste,
                    mother_tongue = user.MotherTongue,
                    education = user.Education,
                    profession = user.Profession,
                    annual_income = user.AnnualIncome,
                    hobbies = user.Hobbies,
                    bio = user.Bio,
                    age = user.Age,
                    location = user.Location,
                    subscription_status = user.SubscriptionStatus
                };
                
                return Ok(userResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the user.", error = ex.Message });
            }
        }
    }
}
