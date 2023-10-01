import asyncio
import json

from typing import Optional

from millegrilles_messages.messages import Constantes
from millegrilles_web.SocketIoHandler import SocketIoHandler
from server_documents import Constantes as ConstantesDocuments


class SocketIoDocumentsHandler(SocketIoHandler):

    def __init__(self, app, stop_event: asyncio.Event):
        super().__init__(app, stop_event)

    async def _preparer_socketio_events(self):
        await super()._preparer_socketio_events()

        # Instances
        # self._sio.on('requeteListeNoeuds', handler=self.requete_liste_noeuds)

    # async def ecouter_consignation(self, sid: str, message: dict):
    #     pass

    # async def ecouter_consignation(self, sid: str, message: dict):
    #     enveloppe = await self.etat.validateur_message.verifier(message)
    #     if enveloppe.get_delegation_globale != Constantes.DELEGATION_GLOBALE_PROPRIETAIRE:
    #         return {'ok': False, 'err': 'Acces refuse'}
    #
    #     exchanges = [Constantes.SECURITE_PRIVE]
    #     routing_keys = [
    #         'evenement.fichiers.presence',
    #         'evenement.fichiers.syncPrimaire',
    #         'evenement.fichiers.syncSecondaire',
    #         'evenement.fichiers.syncUpload',
    #         'evenement.fichiers.syncDownload',
    #         'evenement.CoreTopologie.changementConsignationPrimaire',
    #     ]
    #     reponse = await self.subscribe(sid, message, routing_keys, exchanges, enveloppe=enveloppe)
    #     reponse_signee, correlation_id = self.etat.formatteur_message.signer_message(Constantes.KIND_REPONSE, reponse)
    #     return reponse_signee
    #
    # async def retirer_consignation(self, sid: str, message: dict):
    #     exchanges = [Constantes.SECURITE_PRIVE]
    #     routing_keys = [
    #         'evenement.fichiers.presence',
    #         'evenement.fichiers.syncPrimaire',
    #         'evenement.fichiers.syncSecondaire',
    #         'evenement.fichiers.syncUpload',
    #         'evenement.fichiers.syncDownload',
    #         'evenement.CoreTopologie.changementConsignationPrimaire',
    #     ]
    #     reponse = await self.unsubscribe(sid, message, routing_keys, exchanges)
    #     reponse_signee, correlation_id = self.etat.formatteur_message.signer_message(Constantes.KIND_REPONSE, reponse)
    #     return reponse_signee
