<div align="center">

![Vencord Logo](https://github.com/D3SOX/vencord-userplugins/assets/24937357/f5c06f0e-9d8c-4cca-b990-953d675ec71d)

</div>

### Install MacOS

1. Install [Node.js](https://nodejs.org/)
2. Install [Git](https://git-scm.com/downloads)
4. Open the Terminal
5. Install [pnpm](https://pnpm.io/) using npm: `npm i -g pnpm`
6. Directory `cd ~`
7. Clone the Offical Vencord Repository: `git clone https://github.com/Vendicated/Vencord`
8. Install all required moduls: `cd Vencord && pnpm i`
9.  Create the <b>userplugins</b> directory: `cd src && mkdir userplugins`
10. Clone the WakaTime Proxy Repository: `cd userplugins && git clone https://github.com/JVVeiga/vencord-wakatime`
11. Build and execute the Vencord Repository: `cd ../.. && pnpm build && pnpm inject`

### Install Proxy MacOS

Important: This step is only necessary if you want to use the WakaTime Proxy.

1. Open the Terminal
2. Navigate to the `vencord-wakatime` directory: `cd ~/Vencord/src/userplugins/vencord-wakatime`
3. Make the install script executable:
   ```bash
   chmod +x install.sh
   ```
4. Run the install script:
   ```bash
   ./install.sh
   ```

Proxy listening on port 53128, configure WakaTime to use `http://127.0.0.1:53128/heartbeat` as the proxy URL.
