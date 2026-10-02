namespace DevTrack.API.Models
{
    public class UpdateUserDto
    {
        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? ProfilePicture { get; set; }
    }
}