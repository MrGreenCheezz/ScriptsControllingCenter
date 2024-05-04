import subprocess


class ControllingProcess:
    def __init__(self, ScriptPath, ScriptType):
        self.process = None
        self.path = ScriptPath
        if(ScriptType == "Python"):
            self.type = "python"
        elif(ScriptType == "Node"):
            self.type = "node"

    def start(self):
        if(self.process == None):          
            self.process = subprocess.Popen(self.type + " " + self.path)
        

    def stop(self):
        self.process.terminate()

    def is_running(self):
        if(self.process != None):
            if(self.process.poll() == None):
                return True
        else:
            return False

    def wait(self):
        self.process.wait()