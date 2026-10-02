using DevTrack.API.Data;
using DevTrack.API.Models;
using DevTrack.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtService _jwtService;

        public UsersController(
            AppDbContext context,
            PasswordService passwordService,
            JwtService jwtService)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    ProfilePicture = u.ProfilePicture,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return users;
        }

        // GET: api/Users/1
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    ProfilePicture = u.ProfilePicture,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return user;
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(
            CreateUserDto dto)
        {
            var existingUser = await _context.Users
                .AnyAsync(u =>
                    u.Username == dto.Username ||
                    u.Email == dto.Email);

            if (existingUser)
                return Conflict("Username or email already exists.");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FirstName = string.Empty,
                LastName = string.Empty,
                PasswordHash = _passwordService.HashPassword(dto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var result = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                result
            );
        }

        // POST: api/Users/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null)
                return Unauthorized("Invalid username or password.");

            var passwordValid = _passwordService.VerifyPassword(
                dto.Password,
                user.PasswordHash
            );

            if (!passwordValid)
                return Unauthorized("Invalid username or password.");

            var token = _jwtService.GenerateToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    ProfilePicture = user.ProfilePicture,
                    CreatedAt = user.CreatedAt
                }
            };

            return Ok(response);
        }

        // PUT: api/Users/1
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(
            int id,
            UpdateUserDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found.");

            if (!string.Equals(
                user.Username,
                dto.Username,
                StringComparison.OrdinalIgnoreCase))
            {
                var usernameExists = await _context.Users
                    .AnyAsync(u =>
                        u.Id != id &&
                        u.Username == dto.Username);

                if (usernameExists)
                    return Conflict("Username already exists.");
            }

            if (!string.Equals(
                user.Email,
                dto.Email,
                StringComparison.OrdinalIgnoreCase))
            {
                var emailExists = await _context.Users
                    .AnyAsync(u =>
                        u.Id != id &&
                        u.Email == dto.Email);

                if (emailExists)
                    return Conflict("Email already exists.");
            }

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;

            await _context.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture,
                CreatedAt = user.CreatedAt
            });
        }

        // ==========================================
        // POST: api/Users/{id}/profile-picture
        // ==========================================

        [HttpPost("{id}/profile-picture")]
        public async Task<ActionResult<UserDto>> UploadProfilePicture(
            int id,
            IFormFile file)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found.");

            if (file == null || file.Length == 0)
                return BadRequest("No image was uploaded.");

            // Allowed image types
            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            var extension =
                Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Only JPG, JPEG, PNG, and WEBP images are allowed.");

            // Limit file size to 5 MB
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("Image must be smaller than 5 MB.");

            // Create upload directory
            var uploadFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "profile-pictures"
            );

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            // Generate unique filename
            var fileName =
                $"{user.Id}_{Guid.NewGuid()}{extension}";

            var filePath =
                Path.Combine(uploadFolder, fileName);

            // Save image
            using (var stream = new FileStream(
                filePath,
                FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Delete old profile picture
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                var oldFileName =
                    Path.GetFileName(user.ProfilePicture);

                var oldFilePath =
                    Path.Combine(uploadFolder, oldFileName);

                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            // Save image URL
            user.ProfilePicture =
                $"/uploads/profile-pictures/{fileName}";

            await _context.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture,
                CreatedAt = user.CreatedAt
            });
        }
    }
}