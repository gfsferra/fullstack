<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder para popular o banco com grande volume de usuários.
 * Otimizado para inserção com baixo consumo de memória.
 * 
 * @package Database\Seeders
 */
class MassUserSeeder extends Seeder
{
    /**
     * Total de registros a inserir
     */
    private const TOTAL_RECORDS = 150_000;

    /**
     * Tamanho do batch para inserção (reduzido para economizar memória)
     */
    private const BATCH_SIZE = 1000;

    /**
     * Nomes brasileiros para geração
     * 
     * @var array<int, string> Nomes brasileiros
     */
    private array $firstNames = [
        'João', 'Maria', 'José', 'Ana', 'Pedro', 'Paulo', 'Lucas', 'Gabriel', 
        'Rafael', 'Daniel', 'Marcos', 'Carlos', 'Fernando', 'Rodrigo', 'Bruno',
        'Felipe', 'Gustavo', 'Leonardo', 'Mateus', 'Thiago', 'André', 'Diego',
        'Juliana', 'Camila', 'Amanda', 'Bruna', 'Carolina', 'Fernanda', 'Larissa',
        'Mariana', 'Patrícia', 'Beatriz', 'Isabela', 'Letícia', 'Natália', 'Vanessa',
        'Aline', 'Adriana', 'Cristina', 'Débora', 'Eduarda', 'Flávia', 'Giovana',
        'Helena', 'Íris', 'Jéssica', 'Karen', 'Lorena', 'Michele', 'Nádia',
    ];

    private array $lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
        'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
        'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
        'Dias', 'Nascimento', 'Andrade', 'Moura', 'Nunes', 'Marques', 'Machado',
        'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira',
        'Moreira', 'Castro', 'Araújo', 'Melo', 'Correia', 'Azevedo', 'Campos',
    ];

    private array $emailDomains = [
        'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br',
        'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com', 'live.com',
    ];

    /**
     * Executa o seeder.
     * 
     * @return void
     */
    public function run(): void
    {
        $this->command->info('Iniciando inserção de ' . number_format(self::TOTAL_RECORDS, 0, ',', '.') . ' registros...');
        $this->command->info('Tamanho do batch: ' . number_format(self::BATCH_SIZE, 0, ',', '.'));
        
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::statement('SET UNIQUE_CHECKS=0');
        DB::statement('SET AUTOCOMMIT=0');
        
        $this->command->info('Desabilitando índices...');
        DB::statement('ALTER TABLE users DISABLE KEYS');
        
        $totalBatches = (int) ceil(self::TOTAL_RECORDS / self::BATCH_SIZE);
        $inserted = 0;
        $startTime = microtime(true);
        $now = date('Y-m-d H:i:s');
        
        $this->command->getOutput()->progressStart($totalBatches);
        
        DB::statement('START TRANSACTION');
        
        for ($batch = 0; $batch < $totalBatches; $batch++) {
            $records = [];
            $batchSize = min(self::BATCH_SIZE, self::TOTAL_RECORDS - $inserted);
            
            for ($i = 0; $i < $batchSize; $i++) {
                $records[] = $this->generateUser($inserted + $i, $now);
            }
            
            DB::table('users')->insert($records);
            $inserted += $batchSize;
            
            // Commit a cada 10 batches para evitar lock
            if ($batch % 10 === 0) {
                DB::statement('COMMIT');
                DB::statement('START TRANSACTION');
                gc_collect_cycles(); // Libera memória
            }
            
            $this->command->getOutput()->progressAdvance();
            
            // Limpa memória
            $records = null;
            unset($records);
        }
        
        DB::statement('COMMIT');
        
        $this->command->getOutput()->progressFinish();
        
        $this->command->info('Reabilitando índices (pode demorar)...');
        DB::statement('ALTER TABLE users ENABLE KEYS');
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        DB::statement('SET UNIQUE_CHECKS=1');
        DB::statement('SET AUTOCOMMIT=1');
        
        $totalTime = microtime(true) - $startTime;
        
        $this->command->newLine();
        $this->command->info('Concluído!');
        $this->command->info(sprintf(
            'Total: %s registros em %s (%.0f reg/s)',
            number_format($inserted, 0, ',', '.'),
            $this->formatTime($totalTime),
            $inserted / $totalTime
        ));
    }

    /**
     * Gera um registro de usuário (otimizado para memória).
     */
    private function generateUser(int $index, string $now): array
    {
        $firstName = $this->firstNames[$index % count($this->firstNames)];
        $lastName = $this->lastNames[$index % count($this->lastNames)];
        
        $year = rand(1954, 2006);
        $month = str_pad((string) rand(1, 12), 2, '0', STR_PAD_LEFT);
        $day = str_pad((string) rand(1, 28), 2, '0', STR_PAD_LEFT);
        
        return [
            'name' => $firstName . ' ' . $lastName,
            'email' => strtolower($this->removeAccents($firstName) . '.' . $this->removeAccents($lastName) . $index . '@' . $this->emailDomains[$index % count($this->emailDomains)]),
            'birth_date' => "{$year}-{$month}-{$day}",
            'cpf' => $this->generateCpf(),
            'google_id' => null,
            'avatar' => null,
            'google_token' => null,
            'registration_completed' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    /**
     * Gera um CPF aleatório.
     * 
     * @return string CPF aleatório
     */
    private function generateCpf(): string
    {
        return str_pad((string) rand(0, 99999999999), 11, '0', STR_PAD_LEFT);
    }

    /**
     * Remove acentos de uma string.
     * 
     * @param string $string String com acentos
     * @return string String sem acentos
     */
    private function removeAccents(string $string): string
    {
        $map = [
            'á' => 'a', 'à' => 'a', 'ã' => 'a', 'â' => 'a', 'ä' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
            'ó' => 'o', 'ò' => 'o', 'õ' => 'o', 'ô' => 'o', 'ö' => 'o',
            'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
            'ç' => 'c', 'ñ' => 'n',
            'Á' => 'A', 'À' => 'A', 'Ã' => 'A', 'Â' => 'A', 'Ä' => 'A',
            'É' => 'E', 'È' => 'E', 'Ê' => 'E', 'Ë' => 'E',
            'Í' => 'I', 'Ì' => 'I', 'Î' => 'I', 'Ï' => 'I',
            'Ó' => 'O', 'Ò' => 'O', 'Õ' => 'O', 'Ô' => 'O', 'Ö' => 'O',
            'Ú' => 'U', 'Ù' => 'U', 'Û' => 'U', 'Ü' => 'U',
            'Ç' => 'C', 'Ñ' => 'N',
        ];
        
        return strtr($string, $map);
    }

    /**
     * Formata segundos em tempo legível.
     * 
     * @param float $seconds Segundos
     * @return string Tempo legível
     */
    private function formatTime(float $seconds): string
    {
        if ($seconds < 60) {
            return sprintf('%.0fs', $seconds);
        }
        
        if ($seconds < 3600) {
            return sprintf('%dm %ds', floor($seconds / 60), $seconds % 60);
        }
        
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        
        return sprintf('%dh %dm', $hours, $minutes);
    }
}

