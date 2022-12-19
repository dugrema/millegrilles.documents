import { configureStore } from '@reduxjs/toolkit'
import categoriesSlice from './categoriesSlice'
import groupesSlice, { middlewareSetup as groupeMiddlewareSetup} from './groupesSlice'
import documentsSlice, { middlewareSetup as documentsMiddlewareSetup} from './documentsSlice'

function storeSetup(workers) {

  const groupesMiddleware = groupeMiddlewareSetup(workers)
  const documentsMiddleware = documentsMiddlewareSetup(workers)

  // Configurer le store redux
  const store = configureStore({

    reducer: { 
      categories: categoriesSlice, 
      groupes: groupesSlice,
      documents: documentsSlice,
    },
    middleware: (getDefaultMiddleware) => {
      
      // Prepend, evite le serializability check
      return getDefaultMiddleware()
        .prepend(groupesMiddleware.middleware)
        .prepend(documentsMiddleware.middleware)

    },
  })

  return store
}

export default storeSetup
