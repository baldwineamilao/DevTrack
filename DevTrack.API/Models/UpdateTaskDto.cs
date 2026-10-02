using System.ComponentModel.DataAnnotations;

namespace DevTrack.API.Models;

public class UpdateTaskDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Todo|In Progress|Done)$",
        ErrorMessage = "Status must be Todo, In Progress, or Done.")]
    public string Status { get; set; } = "Todo";

    [Required]
    [RegularExpression("^(Low|Medium|High)$",
        ErrorMessage = "Priority must be Low, Medium, or High.")]
    public string Priority { get; set; } = "Medium";

    public DateTime? DueDate { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int ProjectId { get; set; }

    public int? AssignedUserId { get; set; }
}