import { configureStore } from '@reduxjs/toolkit'
import categoriesSlice from './categoriesSlice'

function storeSetup(workers) {

  // Configurer le store redux
  const store = configureStore({

    reducer: { 
      categories: categoriesSlice, 
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
