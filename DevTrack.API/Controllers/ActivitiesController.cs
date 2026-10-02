using DevTrack.API.Data;
using DevTrack.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivitiesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ActivitiesController(AppDbContext context)
    {
        _context = context;
    }


    // ==========================================
    // GET: api/Activities
    // ==========================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetActivities()
    {
        var activities = await _context.Activities
            .Include(a => a.User)
            .Include(a => a.Project)
            .Include(a => a.Task)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ActivityDto
            {
                Id = a.Id,

                Action = a.Action,

                Description = a.Description,

                CreatedAt = a.CreatedAt,

                UserId = a.UserId,

                User = a.User == null
                    ? null
                    : new UserDto
                    {
                        Id = a.User.Id,
                        Username = a.User.Username,
                        Email = a.User.Email,
                        CreatedAt = a.User.CreatedAt
                    },

                ProjectId = a.ProjectId,

                Project = a.Project == null
                    ? null
                    : new ProjectDto
                    {
                        Id = a.Project.Id,
                        Name = a.Project.Name,
                        Description = a.Project.Description,
                        CreatedAt = a.Project.CreatedAt,
                        OwnerId = a.Project.OwnerId
                    },

                TaskId = a.TaskId,

                Task = a.Task == null
                    ? null
                    : new TaskDto
                    {
                        Id = a.Task.Id,
                        Title = a.Task.Title,
                        Description = a.Task.Description,
                        Status = a.Task.Status,
                        Priority = a.Task.Priority,
                        DueDate = a.Task.DueDate,
                        CreatedAt = a.Task.CreatedAt,
                        ProjectId = a.Task.ProjectId,
                        AssignedUserId = a.Task.AssignedUserId
                    }
            })
            .ToListAsync();

        return activities;
    }


    // ==========================================
    // GET: api/Activities/1
    // ==========================================

    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityDto>> GetActivity(int id)
    {
        var activity = await _context.Activities
            .Include(a => a.User)
            .Include(a => a.Project)
            .Include(a => a.Task)
            .Where(a => a.Id == id)
            .Select(a => new ActivityDto
            {
                Id = a.Id,

                Action = a.Action,

                Description = a.Description,

                CreatedAt = a.CreatedAt,

                UserId = a.UserId,

                User = a.User == null
                    ? null
                    : new UserDto
                    {
                        Id = a.User.Id,
                        Username = a.User.Username,
                        Email = a.User.Email,
                        CreatedAt = a.User.CreatedAt
                    },

                ProjectId = a.ProjectId,

                Project = a.Project == null
                    ? null
                    : new ProjectDto
                    {
                        Id = a.Project.Id,
                        Name = a.Project.Name,
                        Description = a.Project.Description,
                        CreatedAt = a.Project.CreatedAt,
                        OwnerId = a.Project.OwnerId
                    },

                TaskId = a.TaskId,

                Task = a.Task == null
                    ? null
                    : new TaskDto
                    {
                        Id = a.Task.Id,
                        Title = a.Task.Title,
                        Description = a.Task.Description,
                        Status = a.Task.Status,
                        Priority = a.Task.Priority,
                        DueDate = a.Task.DueDate,
                        CreatedAt = a.Task.CreatedAt,
                        ProjectId = a.Task.ProjectId,
                        AssignedUserId = a.Task.AssignedUserId
                    }
            })
            .FirstOrDefaultAsync();

        if (activity == null)
        {
            return NotFound();
        }

        return activity;
    }


    // ==========================================
    // POST: api/Activities
    // ==========================================

    [HttpPost]
    public async Task<ActionResult<ActivityDto>> CreateActivity(
        Activity activity)
    {
        if (activity.UserId.HasValue)
        {
            var userExists =
                await _context.Users.AnyAsync(
                    u => u.Id == activity.UserId.Value
                );

            if (!userExists)
            {
                return BadRequest(
                    "User does not exist."
                );
            }
        }


        if (activity.ProjectId.HasValue)
        {
            var projectExists =
                await _context.Projects.AnyAsync(
                    p => p.Id == activity.ProjectId.Value
                );

            if (!projectExists)
            {
                return BadRequest(
                    "Project does not exist."
                );
            }
        }


        if (activity.TaskId.HasValue)
        {
            var taskExists =
                await _context.Tasks.AnyAsync(
                    t => t.Id == activity.TaskId.Value
                );

            if (!taskExists)
            {
                return BadRequest(
                    "Task does not exist."
                );
            }
        }


        activity.Id = 0;

        activity.CreatedAt = DateTime.UtcNow;


        _context.Activities.Add(activity);

        await _context.SaveChangesAsync();


        return CreatedAtAction(
            nameof(GetActivity),
            new { id = activity.Id },
            await GetActivityDto(activity.Id)
        );
    }


    // ==========================================
    // DELETE: api/Activities/1
    // ==========================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivity(int id)
    {
        var activity =
            await _context.Activities.FindAsync(id);

        if (activity == null)
        {
            return NotFound();
        }


        _context.Activities.Remove(activity);

        await _context.SaveChangesAsync();

        return NoContent();
    }


    // ==========================================
    // HELPER
    // ==========================================

    private async Task<ActivityDto?> GetActivityDto(int id)
    {
        return await _context.Activities
            .Include(a => a.User)
            .Include(a => a.Project)
            .Include(a => a.Task)
            .Where(a => a.Id == id)
            .Select(a => new ActivityDto
            {
                Id = a.Id,

                Action = a.Action,

                Description = a.Description,

                CreatedAt = a.CreatedAt,

                UserId = a.UserId,

                User = a.User == null
                    ? null
                    : new UserDto
                    {
                        Id = a.User.Id,
                        Username = a.User.Username,
                        Email = a.User.Email,
                        CreatedAt = a.User.CreatedAt
                    },

                ProjectId = a.ProjectId,

                Project = a.Project == null
                    ? null
                    : new ProjectDto
                    {
                        Id = a.Project.Id,
                        Name = a.Project.Name,
                        Description = a.Project.Description,
                        CreatedAt = a.Project.CreatedAt,
                        OwnerId = a.Project.OwnerId
                    },

                TaskId = a.TaskId,

                Task = a.Task == null
                    ? null
                    : new TaskDto
                    {
                        Id = a.Task.Id,
                        Title = a.Task.Title,
                        Description = a.Task.Description,
                        Status = a.Task.Status,
                        Priority = a.Task.Priority,
                        DueDate = a.Task.DueDate,
                        CreatedAt = a.Task.CreatedAt,
                        ProjectId = a.Task.ProjectId,
                        AssignedUserId = a.Task.AssignedUserId
                    }
            })
            .FirstOrDefaultAsync();
    }
}