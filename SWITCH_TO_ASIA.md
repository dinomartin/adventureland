# Cara Mengganti Server dari EU ke ASIA

## Perbedaan Region

| Region | Timezone | Display Name | Timezone Offset |
|--------|----------|--------------|-----------------|
| EU     | CET      | Europas      | UTC+1           |
| US     | EST      | Americas     | UTC-5           |
| ASIA   | SEA      | Eastlands    | UTC+7           |

## Langkah-Langkah Mengganti ke ASIA

### 1. Stop Service yang Sedang Berjalan (EU)

```bash
sudo systemctl stop adventureland-node-eu
sudo systemctl disable adventureland-node-eu
```

### 2. Copy Service File ASIA ke systemd

```bash
sudo cp /opt/adventureland/adventureland-node-asia.service /etc/systemd/system/
```

### 3. Edit Service File (Sesuaikan Path & User)

```bash
sudo nano /etc/systemd/system/adventureland-node-asia.service
```

**Ubah baris berikut:**
- `User=youruser` → Ganti dengan user Linux Anda (misal: `root` atau `ubuntu`)
- `WorkingDirectory=/opt/adventureland` → Sesuaikan dengan path instalasi Anda
- `/usr/bin/node` → Pastikan path node.js benar (cek dengan `which node`)

**Parameter Penting:**
- `ASIA` = Region (EU/US/ASIA)
- `I` = Server name (I, II, III, dll)
- `2053` = Port number

### 4. Buat Folder Logs (Jika Belum Ada)

```bash
sudo mkdir -p /opt/adventureland/logs
sudo chown youruser:youruser /opt/adventureland/logs
```

### 5. Reload systemd dan Start Service ASIA

```bash
sudo systemctl daemon-reload
sudo systemctl enable adventureland-node-asia
sudo systemctl start adventureland-node-asia
```

### 6. Cek Status Service

```bash
sudo systemctl status adventureland-node-asia
```

### 7. Monitor Logs Real-time

```bash
# Logs gabungan
sudo journalctl -u adventureland-node-asia -f

# Atau lihat file log langsung
tail -f /opt/adventureland/logs/node-asia.log
tail -f /opt/adventureland/logs/node-asia-error.log
```

## Troubleshooting

### Service Gagal Start

1. **Cek error message:**
   ```bash
   sudo journalctl -u adventureland-node-asia -n 50
   ```

2. **Cek apakah backend Python sudah running:**
   ```bash
   sudo systemctl status adventureland-backend
   ```
   Backend HARUS jalan dulu sebelum Node.js server!

3. **Cek apakah port 2053 sudah dipakai:**
   ```bash
   sudo netstat -tulpn | grep 2053
   ```

4. **Test manual (tanpa service):**
   ```bash
   cd /opt/adventureland
   node node/server.js ASIA I 2053
   ```

### Port Conflict

Jika port 2053 sudah dipakai, ganti ke port lain:
```ini
ExecStart=/usr/bin/node /opt/adventureland/node/server.js ASIA I 2054
```

### Permission Denied

```bash
sudo chown -R youruser:youruser /opt/adventureland
```

## Mengembalikan ke EU

Jika ingin kembali ke EU:

```bash
sudo systemctl stop adventureland-node-asia
sudo systemctl disable adventureland-node-asia
sudo systemctl start adventureland-node-eu
sudo systemctl enable adventureland-node-eu
```

## Menjalankan Multiple Regions Bersamaan

Anda bisa menjalankan EU dan ASIA bersamaan di port berbeda:

```bash
# EU di port 2053
ExecStart=/usr/bin/node /opt/adventureland/node/server.js EU I 2053

# ASIA di port 2054
ExecStart=/usr/bin/node /opt/adventureland/node/server.js ASIA I 2054
```

## Catatan Penting

1. **Database Tetap Sama**: Semua region menggunakan database yang sama dari Python backend
2. **Character Data Tetap Sama**: Character Anda bisa login di region manapun
3. **Timezone Effect**: Event harian (night/day cycle) akan berbeda per region
4. **Restart Required**: Perubahan region memerlukan restart service

## Verifikasi Region Aktif

Setelah service jalan, buka game di browser dan cek:
- Server list seharusnya menampilkan "Eastlands I" (bukan "Europas I")
- Waktu server akan menggunakan UTC+7

---

**Generated for Adventure Land MMORPG**
