using System.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using WorldCities.Server.Data.Models;
using WorldCities.Server.Data;
using System.Runtime.Intrinsics.X86;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace WorldCities.Server.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize(Roles = "Administrator")]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;

        public SeedController(ApplicationDbContext context, IWebHostEnvironment env,
            RoleManager<IdentityRole> roleManager,
            UserManager<AppUser> userManager,
            IConfiguration configuration
            )


        {
            _context = context;
            _env = env;
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult> Import()
        {
            // prevents non-development environments from running this method
            if (!_env.IsDevelopment())
                throw new SecurityException("Not allowed");

            var path = Path.Combine(
                _env.ContentRootPath,
                "Data/Source/worldcities.xlsx");

            using var stream = System.IO.File.OpenRead(path);
            using var excelPackage = new ExcelPackage(stream);

            // get the first worksheet 
            var worksheet = excelPackage.Workbook.Worksheets[0];

            // define how many rows we want to process 
            var nEndRow = worksheet.Dimension.End.Row;

            // initialize the record counters 
            var numberOfCountriesAdded = 0;
            var numberOfCitiesAdded = 0;

            // create a lookup dictionary 
            // containing all the countries already existing 
            // into the Database (it will be empty on first run).
            var countriesByName = _context.Countries
                .AsNoTracking()
                .ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);

            // iterates through all rows, skipping the first one 
            for (int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[
                    nRow, 1, nRow, worksheet.Dimension.End.Column];

                var countryName = row[nRow, 5].GetValue<string>();
                var iso2 = row[nRow, 6].GetValue<string>();
                var iso3 = row[nRow, 7].GetValue<string>();

                // skip this country if it already exists in the database
                if (countriesByName.ContainsKey(countryName))
                    continue;

                // create the Country entity and fill it with xlsx data 
                var country = new Country
                {
                    Name = countryName,
                    ISO2 = iso2,
                    ISO3 = iso3
                };

                // add the new country to the DB context 
                await _context.Countries.AddAsync(country);

                // store the country in our lookup to retrieve its Id later on
                countriesByName.Add(countryName, country);

                // increment the counter 
                numberOfCountriesAdded++;
            }

            // save all the countries into the Database 
            if (numberOfCountriesAdded > 0)
                await _context.SaveChangesAsync();

            // create a lookup dictionary
            // containing all the cities already existing 
            // into the Database (it will be empty on first run). 
            var cities = _context.Cities
                .AsNoTracking()
                .ToDictionary(x => (
                    Name: x.Name,
                    Lat: x.Lat,
                    Lon: x.Lon,
                    Pop:x.Pop,
                    CountryId: x.CountryId));

            // iterates through all rows, skipping the first one 
            for (int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[
                    nRow, 1, nRow, worksheet.Dimension.End.Column];

                var name = row[nRow, 1].GetValue<string>();
                var lat = row[nRow, 3].GetValue<decimal>();
                var lon = row[nRow, 4].GetValue<decimal>();
                var pop = row[nRow, 10].GetValue<double>();
                var countryName = row[nRow, 5].GetValue<string>();

                // retrieve country Id by countryName
                var countryId = countriesByName[countryName].Id;

                // skip this city if it already exists in the database
                if (cities.ContainsKey((
                    Name: name,
                    Lat: lat,
                    Lon: lon,
                    Pop: pop,
                    CountryId: countryId)))
                    continue;

                // create the City entity and fill it with xlsx data 
                var city = new City
                {
                    Name = name,
                    Lat = lat,
                    Lon = lon,
                    Pop = pop,
                    CountryId = countryId
                };

                // add the new city to the DB context 
                _context.Cities.Add(city);

                // increment the counter 
                numberOfCitiesAdded++;
            }

            // save all the cities into the Database 
            if (numberOfCitiesAdded > 0)
                await _context.SaveChangesAsync();

            return new JsonResult(new
            {
                Cities = numberOfCitiesAdded,
                Countries = numberOfCountriesAdded
            });
        }

        [HttpGet]
        public async Task<ActionResult> CreateDefaultUsers()
        {
            // setup the default role names
            string role_RegisteredUser = "RegisteredUser";
            string role_Administrator = "Administrator";


            //create default roles if they dont exist
            if (await _roleManager.FindByNameAsync(role_RegisteredUser) == null)
                await _roleManager.CreateAsync(new IdentityRole(role_RegisteredUser)); 
            
            if (await _roleManager.FindByNameAsync(role_Administrator) == null)
                await _roleManager.CreateAsync(new IdentityRole(role_Administrator));

              //to track newly added user
              var addeduserlist = new List<AppUser>();


            //check if admin exists
            var email_Admin = "admin@email.com";
            if(await _userManager.FindByNameAsync(email_Admin) == null)
            {
                //create new admin appuser account
                var user_Admin = new AppUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_Admin,
                    Email = email_Admin,
                };

                await _userManager.CreateAsync(user_Admin, _configuration["DefaultPasswords:Administrator"]);

                //assign the "registeredUser" and "administrator" role
                await _userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
                await _userManager.AddToRoleAsync(user_Admin, role_Administrator);

                // confirm the e-mail and remove lockout
                user_Admin.EmailConfirmed = true;
                user_Admin.LockoutEnabled = false;

                //add admin to added user list
                addeduserlist.Add(user_Admin);
            }

            //check if standars user exists
            var email_user = "user@email.com";
            if (await _userManager.FindByNameAsync(email_user) == null)
            {
                //create new admin appuser account
                var user_User = new AppUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_user,
                    Email = email_user,
                };

                await _userManager.CreateAsync(user_User, _configuration["DefaultPasswords:Administrator"]);

                //assign the "registeredUser"  role
                await _userManager.AddToRoleAsync(user_User, role_RegisteredUser);

                // confirm the e-mail and remove lockout
                user_User.EmailConfirmed = true;
                user_User.LockoutEnabled = false;

                //add admin to added user list
                addeduserlist.Add(user_User);
            }

            if(addeduserlist.Count > 0)
                await _context.SaveChangesAsync();

            return new JsonResult(new
            {
                Count = addeduserlist.Count,
                Users = addeduserlist
            });
        }

    }
}