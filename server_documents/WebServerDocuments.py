import logging

from millegrilles_web.WebServer import WebServer

from server_documents import Constantes as ConstantesDocuments
from server_documents.SocketIoDocumentsHandler import SocketIoDocumentsHandler


class WebServerDocuments(WebServer):

    def __init__(self, etat, commandes):
        self.__logger = logging.getLogger(__name__ + '.' + self.__class__.__name__)
        super().__init__(ConstantesDocuments.WEBAPP_PATH, etat, commandes)

    def get_nom_app(self) -> str:
        return ConstantesDocuments.APP_NAME

    async def setup_socketio(self):
        """ Wiring socket.io """
        # Utiliser la bonne instance de SocketIoHandler dans une sous-classe
        self._socket_io_handler = SocketIoDocumentsHandler(self, self._stop_event)
        await self._socket_io_handler.setup()

    async def _preparer_routes(self):
        self.__logger.info("Preparer routes WebServerDocuments sous /documents")
        await super()._preparer_routes()
