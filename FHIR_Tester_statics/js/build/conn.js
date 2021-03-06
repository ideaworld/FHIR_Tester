var app = app || {};

(function(){
    app.setup_websocket = function(task_id,place){
        if(app.tasksocket){
            app.tasksocket.close();
        }
        console.log(task_id);
        var ws_scheme = window.location.protocol == "https" ? "wss" : "ws";
        var tasksocket = app.tasksocket =  new ReconnectingWebSocket(ws_scheme + '://tester.ideaworld.org/task/' + task_id);
        tasksocket.onmessage = function(message){
            var data = JSON.parse(message.data);
            // console.log(window.comp)
            if(data.place == 1){
                window.comp.updateTestResult(data.step_result);
            }else if(data.place == 2){
                window.hist.updateTestResult(data.step_result);
            }else if(data.place == 3){
                window.searchView.updateTestResult(data.step_result);
            }
            if(data.isFinal){
                window.comp.showReportView(data.test_report);
            }
            
        }
        tasksocket.onopen = function(e){
            var data = {
                task_id:task_id,
                place:place
            }
            tasksocket.send(JSON.stringify(data));
        }

    }
})();