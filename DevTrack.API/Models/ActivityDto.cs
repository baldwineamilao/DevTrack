namespace DevTrack.API.Models;

public class ActivityDto
{
    public int Id { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }


    public int? UserId { get; set; }

    public UserDto? User { get; set; }


    public int? ProjectId { get; set; }

    public ProjectDto? Project { get; set; }


    public int? TaskId { get; set; }

    public TaskDto? Task { get; set; }
}