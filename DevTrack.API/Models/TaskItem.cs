namespace DevTrack.API.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "Todo";

    public string Priority { get; set; } = "Medium";

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }

    public Project? Project { get; set; }

    public int? AssignedUserId { get; set; }

    public User? AssignedUser { get; set; }
}