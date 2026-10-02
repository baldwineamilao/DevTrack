using DevTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Activity> Activities { get; set; }
}