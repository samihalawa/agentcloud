use mongodb::Database;
use std::fmt::Debug;
use std::marker::Send;
use std::sync::Arc;
use std::thread::available_parallelism;
use tokio::sync::RwLock;

use queues::Queue;
use queues::*;
use threadpool::ThreadPool;

use qdrant_client::client::QdrantClient;

use crate::data::processing_incoming_messages::process_messages;

pub struct Pool<T: Clone> {
    pub q: Queue<T>,
    pub pool: ThreadPool,
}

// This defines implementations of each of the methods in the class
// This implementation is generic for all types that are both Send and Clone
// T must be Send in order to be sent safely across threads
impl<T: Clone + Send> Pool<T>
    where
        T: Debug,
        String: From<T>,
{
    pub fn new(pool_size: usize) -> Self {
        Pool {
            q: Queue::new(),
            pool: ThreadPool::new(pool_size),
        }
    }

    pub fn optimised(thread_utilisation_percentage: f64) -> Self {
        let threads_utilised = available_parallelism()
            .map(|t| (t.get() as f64 * thread_utilisation_percentage) as usize)
            .unwrap_or(1);
        log::debug!("Threads used: {}", threads_utilised);
        Pool {
            q: Queue::new(),
            pool: ThreadPool::new(threads_utilised),
        }
    }

    pub fn default() -> Self {
        let default_threads = available_parallelism().map(|t| t.get()).unwrap_or(1);
        Pool {
            q: Queue::new(),
            pool: ThreadPool::new(default_threads),
        }
    }

    pub fn enqueue(&mut self, task: T) {
        log::debug!("Enqueueing task, current queue size before adding: {}", self.q.size());
        self.q.add(task).unwrap_or_else(|_| None);
        log::debug!("Task added, current queue size after adding: {}", self.q.size());
    }

    pub fn embed_message(
        &mut self,
        qdrant_conn: Arc<RwLock<QdrantClient>>,
        mongo_conn: Arc<RwLock<Database>>,
        message: String,
    ) {
        while self.q.size() > 0 {
            let task = match self.q.remove() {
                Ok(t) => t,
                _ => continue, //Because ! (continue) can never have a value, Rust decides that the type of guess is u32.
            };
            // We try and coerce T into String type, if it can't we handle the error
            let id = match String::try_from(task) {
                Ok(i) => i,
                Err(_) => continue,
            };
            let data = message.clone();
            let qdrant_client = Arc::clone(&qdrant_conn);
            let mongo_client = Arc::clone(&mongo_conn);

            self.pool.execute(move || {
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    let _ = process_messages(qdrant_client, mongo_client, data, id).await;
                })
            });
        }
    }
}
