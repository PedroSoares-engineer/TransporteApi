using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteApi.Data;
using System.Linq;

namespace TransporteApi.Controllers
{
    [ApiController]
    [Route("api/usuario")]
    [Authorize] // Exige estar logado
    public class UsuarioController : ControllerBase
    {
        private readonly TransporteContext _context;

        public UsuarioController(TransporteContext context)
        {
            _context = context;
        }

        // Rota para o Proprietário ver todos os usuários e admins
        [HttpGet("todos")]
        public IActionResult GetTodosUsuarios()
        {
            // Busca apenas Id, Nome e Regra (nunca enviamos a senha por segurança!)
            var usuarios = _context.Usuarios
                .Select(u => new { u.Id, u.Nome, u.Regra })
                .OrderBy(u => u.Nome)
                .ToList();

            return Ok(usuarios);
        }
    }
}
