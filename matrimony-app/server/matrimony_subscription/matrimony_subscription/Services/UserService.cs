using matrimony_subscription.Data;
using matrimony_subscription.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace matrimony_subscription.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> UpdateUserColumnAsync(long userId, string columnName, string newValue)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                // Convert column names to property names
                var propertyName = MapColumnNameToProperty(columnName);
                var property = typeof(User).GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                
                if (property != null && property.CanWrite)
                {
                    // Handle subscription status
                    if (columnName.Equals("subscription_status", StringComparison.OrdinalIgnoreCase))
                    {
                        if (int.TryParse(newValue, out int subscriptionStatus))
                        {
                            property.SetValue(user, subscriptionStatus);
                        }
                        else
                        {
                            return false;
                        }
                    }
                    else
                    {
                        // Handle other fields
                        try
                        {
                            object convertedValue = Convert.ChangeType(newValue, property.PropertyType);
                            property.SetValue(user, convertedValue);
                        }
                        catch
                        {
                            return false;
                        }
                    }

                    await _context.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                // Log error
                return false;
            }
        }

        // Get user by ID
        public async Task<User?> GetUserByIdAsync(long userId)
        {
            try
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private string MapColumnNameToProperty(string columnName)
        {
            // Convert database column names to C# properties
            return columnName.ToLower() switch
            {
                "first_name" => "FirstName",
                "last_name" => "LastName",
                "date_of_birth" => "DateOfBirth",
                "marital_status" => "MaritalStatus",
                "mother_tongue" => "MotherTongue",
                "annual_income" => "AnnualIncome",
                "subscription_status" => "SubscriptionStatus",
                _ => columnName
            };
        }
    }
}
