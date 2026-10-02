using DevTrack.API.Data;
using DevTrack.API.Models;
using DevTrack.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ActivityService _activityService;

    public TasksController(
        AppDbContext context,
        ActivityService activityService)
    {
        _context = context;
        _activityService = activityService;
    }

    // GET: api/Tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks()
    {
        var tasks = await _context.Tasks
            .Include(t => t.Project)
                .ThenInclude(p => p!.Owner)
            .Include(t => t.AssignedUser)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,

                ProjectId = t.ProjectId,

                Project = t.Project == null
                    ? null
                    : new ProjectDto
                    {
                        Id = t.Project.Id,
                        Name = t.Project.Name,
                        Description = t.Project.Description,
                        CreatedAt = t.Project.CreatedAt,
                        OwnerId = t.Project.OwnerId,

                        Owner = t.Project.Owner == null
                            ? null
                            : new UserDto
                            {
                                Id = t.Project.Owner.Id,
                                Username = t.Project.Owner.Username,
                                Email = t.Project.Owner.Email
                            }
                    },

                AssignedUserId = t.AssignedUserId,

                AssignedUser = t.AssignedUser == null
                    ? null
                    : new UserDto
                    {
                        Id = t.AssignedUser.Id,
                        Username = t.AssignedUser.Username,
                        Email = t.AssignedUser.Email
                    }
            })
            .ToListAsync();

        return tasks;
    }

    // GET: api/Tasks/1
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
                .ThenInclude(p => p!.Owner)
            .Include(t => t.AssignedUser)
            .Where(t => t.Id == id)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,

                ProjectId = t.ProjectId,

                Project = t.Project == null
                    ? null
                    : new ProjectDto
                    {
                        Id = t.Project.Id,
                        Name = t.Project.Name,
                        Description = t.Project.Description,
                        CreatedAt = t.Project.CreatedAt,
                        OwnerId = t.Project.OwnerId,

                        Owner = t.Project.Owner == null
                            ? null
                            : new UserDto
                            {
                                Id = t.Project.Owner.Id,
                                Username = t.Project.Owner.Username,
                                Email = t.Project.Owner.Email
                            }
                    },

                AssignedUserId = t.AssignedUserId,

                AssignedUser = t.AssignedUser == null
                    ? null
                    : new UserDto
                    {
                        Id = t.AssignedUser.Id,
                        Username = t.AssignedUser.Username,
                        Email = t.AssignedUser.Email
                    }
            })
            .FirstOrDefaultAsync();

        if (task == null)
            return NotFound();

        return task;
    }

    // POST: api/Tasks
    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto dto)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == dto.ProjectId);

        if (!projectExists)
            return BadRequest("Project does not exist.");

        if (dto.AssignedUserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == dto.AssignedUserId.Value);

            if (!userExists)
                return BadRequest("Assigned user does not exist.");
        }

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            ProjectId = dto.ProjectId,
            AssignedUserId = dto.AssignedUserId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _activityService.LogAsync(
            "Task Created",
            $"Created task '{task.Title}'",
            task.AssignedUserId,
            task.ProjectId,
            task.Id
        );

        return CreatedAtAction(
            nameof(GetTask),
            new { id = task.Id },
            await GetTaskDto(task.Id)
        );
    }

    // PUT: api/Tasks/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(
        int id,
        UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
            return NotFound();

        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == dto.ProjectId);

        if (!projectExists)
            return BadRequest("Project does not exist.");

        if (dto.AssignedUserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == dto.AssignedUserId.Value);

            if (!userExists)
                return BadRequest("Assigned user does not exist.");
        }

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.ProjectId = dto.ProjectId;
        task.AssignedUserId = dto.AssignedUserId;

        await _context.SaveChangesAsync();

        await _activityService.LogAsync(
            "Task Updated",
            $"Updated task '{task.Title}'",
            task.AssignedUserId,
            task.ProjectId,
            task.Id
        );

        return NoContent();
    }

    // PUT: api/Tasks/1/complete
    [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteTask([FromRoute] int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound();

            task.Status = "Done";

            await _context.SaveChangesAsync();

            await _activityService.LogAsync(
                "Task Completed",
                $"Completed task '{task.Title}'",
                task.AssignedUserId,
                task.ProjectId,
                task.Id
            );

            return NoContent();
        }

    // PUT: api/Tasks/1/reopen
    [HttpPut("{id}/reopen")]
        public async Task<IActionResult> ReopenTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound();

            task.Status = "To Do";

            await _context.SaveChangesAsync();

            await _activityService.LogAsync(
                "Task Reopened",
                $"Reopened task '{task.Title}'",
                task.AssignedUserId,
                task.ProjectId,
                task.Id
            );

            return NoContent();
        }

    // DELETE: api/Tasks/1  
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
            return NotFound();

        // Remove activities related to this task first
        var activities = await _context.Activities
            .Where(a => a.TaskId == id)
            .ToListAsync();

        if (activities.Any())
        {
            _context.Activities.RemoveRange(activities);
        }

        // Remove the task
        _context.Tasks.Remove(task);

                await _context.SaveChangesAsync();

        return NoContent();
    }

    // ==========================================
    // GET TASK DTO
    // ==========================================

    private async Task<TaskDto?> GetTaskDto(int id)
    {
        return await _context.Tasks
            .Include(t => t.Project)
                .ThenInclude(p => p!.Owner)
            .Include(t => t.AssignedUser)
            .Where(t => t.Id == id)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,

                ProjectId = t.ProjectId,

                Project = t.Project == null
                    ? null
                    : new ProjectDto
                    {
                        Id = t.Project.Id,
                        Name = t.Project.Name,
                        Description = t.Project.Description,
                        CreatedAt = t.Project.CreatedAt,
                        OwnerId = t.Project.OwnerId,

                        Owner = t.Project.Owner == null
                            ? null
                            : new UserDto
                            {
                                Id = t.Project.Owner.Id,
                                Username = t.Project.Owner.Username,
                                Email = t.Project.Owner.Email
                            }
                    },

                AssignedUserId = t.AssignedUserId,

                AssignedUser = t.AssignedUser == null
                    ? null
                    : new UserDto
                    {
                        Id = t.AssignedUser.Id,
                        Username = t.AssignedUser.Username,
                        Email = t.AssignedUser.Email
                    }
            })
            .FirstOrDefaultAsync();
    }
}