const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportsPlaylistsHandler = this.postExportsPlaylistsHandler.bind(this);
  }

  async postExportsPlaylistsHandler(request, h) {
    try {
      this._validator.validateExportsPlaylistsPayload(request.payload);
      const { id: userId } = request.auth.credentials;
      const { targetEmail } = request.payload;
      const { playlistId } = request.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

      const message = {
        targetEmail,
        playlistId,
      };

      await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;
