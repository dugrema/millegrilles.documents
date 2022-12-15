import { configureStore } from '@reduxjs/toolkit'
import categoriesSlice from './categoriesSlice'
import groupesSlice from './groupesSlice'

function storeSetup(workers) {

  // Configurer le store redux
  const store = configureStore({

    reducer: { 
      categories: categoriesSlice, 
      groupes: groupesSlice,
    },

    middleware: (getDefaultMiddleware) => {
      
      // const { appareilsMiddleware } = appareilsMiddlewareSetup(workers)

      // Prepend, evite le serializability check
      return getDefaultMiddleware()
        // .prepend(appareilsMiddleware.middleware)

    },
  })

  return store
}

export default storeSetup
