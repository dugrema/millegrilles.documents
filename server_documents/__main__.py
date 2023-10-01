import argparse
import asyncio
import logging
import signal

from millegrilles_web.WebAppMain import WebAppMain

from millegrilles_web.WebAppMain import LOGGING_NAMES as LOGGING_NAMES_WEB, adjust_logging
from server_documents.WebServerDocuments import WebServerDocuments
from server_documents.Commandes import CommandDocumentsHandler

logger = logging.getLogger(__name__)

LOGGING_NAMES = ['server_documents']
LOGGING_NAMES.extend(LOGGING_NAMES_WEB)


class CoupdoeilAppMain(WebAppMain):

    def __init__(self):
        self.__logger = logging.getLogger(__name__ + '.' + self.__class__.__name__)
        super().__init__()

    def init_command_handler(self) -> CommandDocumentsHandler:
        return CommandDocumentsHandler(self)

    async def configurer(self):
        await super().configurer()

    async def configurer_web_server(self):
        self._web_server = WebServerDocuments(self.etat, self._commandes_handler)
        await self._web_server.setup(stop_event=self._stop_event)

    def exit_gracefully(self, signum=None, frame=None):
        self.__logger.info("Fermer application, signal: %d" % signum)
        self._stop_event.set()

    def parse(self) -> argparse.Namespace:
        args = super().parse()
        adjust_logging(LOGGING_NAMES_WEB, args)
        return args


async def demarrer():
    main_inst = CoupdoeilAppMain()

    signal.signal(signal.SIGINT, main_inst.exit_gracefully)
    signal.signal(signal.SIGTERM, main_inst.exit_gracefully)

    await main_inst.configurer()
    logger.info("Run main documents")
    await main_inst.run()
    logger.info("Fin main documents")


def main():
    """
    Methode d'execution de l'application
    :return:
    """
    logging.basicConfig()
    for log in LOGGING_NAMES:
        logging.getLogger(log).setLevel(logging.INFO)
    asyncio.run(demarrer())


if __name__ == '__main__':
    main()