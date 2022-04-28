import { Server } from 'http';
import http from 'http';
import { ArtusApplication, ApplicationLifecycle, ApplicationExtension, ApplicationHook, WithApplication } from '@xprofiler/artus-core';
import { Input } from '@artus/pipeline';
import { registerController } from './decorator';
import HttpTrigger from './trigger/http';

@ApplicationExtension()
export default class ApplicationHookExtension implements ApplicationLifecycle {
  private app: ArtusApplication;
  private server: Server | null;

  constructor(@WithApplication() app: ArtusApplication) {
    this.app = app;
    this.server = null;
  }

  @ApplicationHook()
  willReady() {
    const config = this.app.config ?? {};
    const port = config.port;
    this.server = http
      .createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const input = new Input();
        input.params = { req, res, config, app: this.app };
        await this.app.trigger.startPipeline(input);
      })
      .listen(port);
  }

  @ApplicationHook()
  async didLoad() {
    registerController(this.app.trigger as HttpTrigger);
  }

  @ApplicationHook()
  beforeClose() {
    this.server?.close();
  }
}
