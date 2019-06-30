# admiral-hipper

> Server back-end untuk [Charaverse](https://charaverse.tkesgar.com)

## Kebutuhan sistem

  - Node.js
  - MySQL
  - Yarn (disarankan)

## Setup development

  1. Clone repositori ini.

```bash
git clone https://github.com/tkesgar/admiral-hipper
```

  2. Install dependencies.

```bash
yarn
```

  3. Apabila dibutuhkan, buat file `env/.env` untuk mengubah nilai env default
     yang tersedia di `env/default.env`. Misalnya, untuk mengubah nama user dan
     password MySQL:

```
MYSQL_USER = dbuser
MYSQL_PASS = dbpass
```

  4. Jalankan migrasi database MySQL.

```bash
yarn knex migrate:latest
```

  5. Jalankan server dalam mode development, kemudian jalankan development file server.

```bash
# Di salah satu terminal
yarn dev

# Di terminal yang satu lagi
yarn dev:files
```

  6. Server bisa diakses lewat `http://localhost:3000` (port default).

## Lisensi

Dilisensi di bawah [MIT License][lic].

[lic]: https://github.com/tkesgar/admiral-hipper/blob/master/LICENSE
