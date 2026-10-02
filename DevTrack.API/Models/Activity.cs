namespace DevTrack.API.Models;

public class Activity
{
    public int Id { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    // User who performed the activity
    public int? UserId { get; set; }

    public User? User { get; set; }


    // Related project
    public int? ProjectId { get; set; }

    public Project? Project { get; set; }


    // Related task
    public int? TaskId { get; set; }

    public TaskItem? Task { get; set; }
}