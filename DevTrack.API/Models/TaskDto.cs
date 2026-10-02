namespace DevTrack.API.Models;

public class TaskDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public int ProjectId { get; set; }

    public ProjectDto? Project { get; set; }

    public int? AssignedUserId { get; set; }

    public UserDto? AssignedUser { get; set; }
}