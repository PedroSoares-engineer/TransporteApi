using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransporteApi.Data;
using TransporteApi.Models;

namespace TransporteApi.Controllers;

[ApiController]
[Route("api/[controller]")] // A rota final será: api/transporte
public class TransporteController : ControllerBase
{
    private readonly TransporteContext _context;

    // Injeção de Dependência: o .NET entrega a instância do contexto do banco em memória
    public TransporteController(TransporteContext context)
    {
        _context = context;
    }

    // GET: api/transporte (Lista todas as linhas cadastradas)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LinhaOnibus>>> GetAll()
    {
        return await _context.LinhasOnibus.ToListAsync();
    }

    // GET: api/transporte/{id} (Busca uma linha específica pelo ID)
    [HttpGet("{id}")]
    public async Task<ActionResult<LinhaOnibus>> GetById(int id)
    {
        var linha = await _context.LinhasOnibus.FindAsync(id);
        if (linha == null)
        {
            return NotFound();
        }
        return linha;
    }

    // POST: api/transporte (Cadastra uma nova linha de ônibus)
    [HttpPost]
    public async Task<ActionResult<LinhaOnibus>> Create(LinhaOnibus linha)
    {
        _context.LinhasOnibus.Add(linha);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = linha.Id }, linha);
    }

    // PUT: api/transporte/{id} (Atualiza o status ou lotação da linha)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, LinhaOnibus linha)
    {
        if (id != linha.Id)
        {
            return BadRequest();
        }

        _context.Entry(linha).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.LinhasOnibus.Any(e => e.Id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/transporte/{id} (Remove uma linha do sistema)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var linha = await _context.LinhasOnibus.FindAsync(id);
        if (linha == null)
        {
            return NotFound();
        }

        _context.LinhasOnibus.Remove(linha);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
