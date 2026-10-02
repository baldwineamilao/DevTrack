using DevTrack.API.Data;
using DevTrack.API.Models;

namespace DevTrack.API.Services;

public class ActivityService
{
    private readonly AppDbContext _context;

    public ActivityService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(
        string action,
        string description,
        int? userId = null,
        int? projectId = null,
        int? taskId = null)
    {
        var activity = new Activity
        {
            Action = action,
            Description = description,
            UserId = userId,
            ProjectId = projectId,
            TaskId = taskId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Activities.Add(activity);

        await _context.SaveChangesAsync();
    }
}