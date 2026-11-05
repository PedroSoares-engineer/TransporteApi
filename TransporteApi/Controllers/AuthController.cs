using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TransporteApi.Data;

namespace TransporteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TransporteContext _context;

        public AuthController(TransporteContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var usuario = _context.Usuarios.FirstOrDefault(u => u.Email == request.Email);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            {
                return Unauthorized(new { mensagem = "E-mail ou palavra-passe inválidos." });
            }

            var chave = Encoding.ASCII.GetBytes("ChaveMestraSeguraTransporteInteligente2026!");
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, usuario.Nome),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim(ClaimTypes.Role, usuario.Regra)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(chave),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                usuario = new
                {
                    id = usuario.Id,
                    nome = usuario.Nome,
                    email = usuario.Email,
                    regra = usuario.Regra,
                    cidade = usuario.Cidade,
                    estado = usuario.Estado
                }
            });
        }

        [HttpPost("registrar")]
        public IActionResult Registrar([FromBody] RegistroRequest request)
        {
            var idade = DateTime.Today.Year - request.DataNascimento.Year;
            if (request.DataNascimento.Date > DateTime.Today.AddYears(-idade))
                idade--;

            if (idade < 14)
                return BadRequest(new { mensagem = "É necessário ter pelo menos 14 anos para criar conta." });

            if (_context.Usuarios.Any(u => u.Email == request.Email))
                return BadRequest(new { mensagem = "Este e-mail já está em uso." });

            var novoUsuario = new TransporteApi.Models.Usuario
            {
                Nome = request.Nome,
                Email = request.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                Regra = "Comum",
                Telefone = request.Telefone,
                DataNascimento = request.DataNascimento,
                Cidade = request.Cidade,
                Estado = request.Estado
            };

            _context.Usuarios.Add(novoUsuario);
            _context.SaveChanges();

            return Ok(new { mensagem = "Conta criada com sucesso! Já pode fazer login." });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }

    public class RegistroRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string Cidade { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
    }
}
