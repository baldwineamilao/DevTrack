using DevTrack.API.Data;
using DevTrack.API.Models;
using DevTrack.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ActivityService _activityService;

        public ProjectsController(
            AppDbContext context,
            ActivityService activityService)
        {
            _context = context;
            _activityService = activityService;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects.ToListAsync();
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
                return NotFound();

            return project;
        }

        // POST: api/Projects
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(
            CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                OwnerId = dto.OwnerId,
                CreatedAt = DateTime.UtcNow
            };

           _context.Projects.Add(project);

            await _context.SaveChangesAsync();

            await _activityService.LogAsync(
                "Project Created",
                $"Created project '{project.Name}'",
                project.OwnerId,
                project.Id
            );

            return CreatedAtAction(
                nameof(GetProject),
                new { id = project.Id },
                project
            );
        }

        // PUT: api/Projects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(
            int id,
            CreateProjectDto dto)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
                return NotFound();

            project.Name = dto.Name;
            project.Description = dto.Description;
            project.OwnerId = dto.OwnerId;

            await _context.SaveChangesAsync();

            await _activityService.LogAsync(
                "Project Updated",
                $"Updated project '{project.Name}'",
                project.OwnerId,
                project.Id
            );

            return NoContent();
        }

       // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
                return NotFound();

            // Get all tasks belonging to this project
            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == id)
                .ToListAsync();

            // Get activities belonging to this project
            var projectActivities = await _context.Activities
                .Where(a => a.ProjectId == id)
                .ToListAsync();

            // Get activities belonging to tasks in this project
            var taskIds = tasks
                .Select(t => t.Id)
                .ToList();

            var taskActivities = await _context.Activities
                .Where(a => a.TaskId.HasValue && taskIds.Contains(a.TaskId.Value))
                .ToListAsync();

            // Delete task activities
            if (taskActivities.Any())
            {
                _context.Activities.RemoveRange(taskActivities);
            }

            // Delete project activities
            if (projectActivities.Any())
            {
                _context.Activities.RemoveRange(projectActivities);
            }

            // Delete tasks
            if (tasks.Any())
            {
                _context.Tasks.RemoveRange(tasks);
            }

            // Delete project
            _context.Projects.Remove(project);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}