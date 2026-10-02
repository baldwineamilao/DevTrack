namespace DevTrack.API.Models;

public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int OwnerId { get; set; }
}