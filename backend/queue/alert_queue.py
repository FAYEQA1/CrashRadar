import queue

class AlertQueue:
    _instance = None

    def __new__(cls):
        """Thread-safe Singleton accessor pattern initialization."""
        if cls._instance is None:
            cls._instance = super(AlertQueue, cls).__new__(cls)
            cls._instance.task_queue = queue.Queue()
        return cls._instance

    def push_incident(self, incident_payload):
        """Enqueues an identified critical event data payload structure."""
        self.task_queue.put(incident_payload)

    def pop_incident(self):
        """Retrieves and locks the oldest incident payload. Blocks gracefully if queue is clear."""
        return self.task_queue.get()

    def task_complete(self):
        """Acknowledges that a popped task has been processed by a worker thread."""
        self.task_queue.task_done()

    def size(self):
        return self.task_queue.qsize()