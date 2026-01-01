<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Seeder para popular o banco com grande volume de usuários.
 * Otimizado para inserção de milhões de registros.
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
     * Tamanho do batch para inserção
     */
    private const BATCH_SIZE = 5000;

    /**
     * Nomes brasileiros para geração
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
     */
    public function run(): void
    {
        $this->command->info('🚀 Iniciando inserção de ' . number_format(self::TOTAL_RECORDS, 0, ',', '.') . ' registros...');
        $this->command->info('📦 Tamanho do batch: ' . number_format(self::BATCH_SIZE, 0, ',', '.'));
        
        // Desabilitar verificações para acelerar
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::statement('SET UNIQUE_CHECKS=0');
        DB::statement('SET AUTOCOMMIT=0');
        
        // Desabilitar índices temporariamente
        $this->command->info('⏸️  Desabilitando índices...');
        DB::statement('ALTER TABLE users DISABLE KEYS');
        
        $totalBatches = ceil(self::TOTAL_RECORDS / self::BATCH_SIZE);
        $inserted = 0;
        $startTime = microtime(true);
        
        $this->command->getOutput()->progressStart($totalBatches);
        
        for ($batch = 0; $batch < $totalBatches; $batch++) {
            $records = [];
            $batchSize = min(self::BATCH_SIZE, self::TOTAL_RECORDS - $inserted);
            
            for ($i = 0; $i < $batchSize; $i++) {
                $records[] = $this->generateUser($inserted + $i);
            }
            
            DB::table('users')->insert($records);
            $inserted += $batchSize;
            
            // Commit a cada 50 batches
            if ($batch % 50 === 0) {
                DB::statement('COMMIT');
                DB::statement('START TRANSACTION');
            }
            
            $this->command->getOutput()->progressAdvance();
            
            // Liberar memória
            unset($records);
            
            // Log a cada 1 milhão
            if ($inserted % 1_000_000 === 0) {
                $elapsed = microtime(true) - $startTime;
                $rate = $inserted / $elapsed;
                $remaining = (self::TOTAL_RECORDS - $inserted) / $rate;
                
                $this->command->newLine();
                $this->command->info(sprintf(
                    '📊 Progresso: %s registros (%.1f%%) | %.0f reg/s | Tempo restante: %s',
                    number_format($inserted, 0, ',', '.'),
                    ($inserted / self::TOTAL_RECORDS) * 100,
                    $rate,
                    $this->formatTime($remaining)
                ));
            }
        }
        
        DB::statement('COMMIT');
        
        $this->command->getOutput()->progressFinish();
        
        // Reabilitar índices
        $this->command->info('▶️  Reabilitando índices (pode demorar)...');
        DB::statement('ALTER TABLE users ENABLE KEYS');
        
        // Restaurar configurações
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        DB::statement('SET UNIQUE_CHECKS=1');
        DB::statement('SET AUTOCOMMIT=1');
        
        $totalTime = microtime(true) - $startTime;
        
        $this->command->newLine();
        $this->command->info('✅ Concluído!');
        $this->command->info(sprintf(
            '📈 Total: %s registros em %s (%.0f reg/s)',
            number_format($inserted, 0, ',', '.'),
            $this->formatTime($totalTime),
            $inserted / $totalTime
        ));
    }

    /**
     * Gera um registro de usuário.
     */
    private function generateUser(int $index): array
    {
        $firstName = $this->firstNames[array_rand($this->firstNames)];
        $lastName = $this->lastNames[array_rand($this->lastNames)];
        $name = $firstName . ' ' . $lastName;
        
        $email = strtolower(
            $this->removeAccents($firstName) . 
            '.' . 
            $this->removeAccents($lastName) . 
            $index . 
            '@' . 
            $this->emailDomains[array_rand($this->emailDomains)]
        );
        
        $now = Carbon::now();
        $birthDate = Carbon::now()->subYears(rand(18, 70))->subDays(rand(0, 365));
        
        return [
            'name' => $name,
            'email' => $email,
            'birth_date' => $birthDate->format('Y-m-d'),
            'cpf' => $this->generateCpf(),
            'google_id' => rand(0, 1) ? (string) rand(100000000000000000, 999999999999999999) : null,
            'avatar' => null,
            'google_token' => null,
            'registration_completed' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    /**
     * Gera um CPF aleatório (apenas números).
     */
    private function generateCpf(): string
    {
        return str_pad((string) rand(0, 99999999999), 11, '0', STR_PAD_LEFT);
    }

    /**
     * Remove acentos de uma string.
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

