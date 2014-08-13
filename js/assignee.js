///////////////////////////////////////////////////////////
// (c)2014 fortissimo1997, all right reserved.
// author fortissimo1997, 2014/07/14
///////////////////////////////////////////////////////////

$(function(){
    var re = new RegExp("^https://github.com/([^/]+)/([^/]+)/.+$");
    var match = re.exec(document.location);
    var re_link = new RegExp("^<(https://api.github.com/[^>]+)>; rel=\"next\",");
    var assignees = {
        'user_name': [],
        'details': []
    };
    var path;
    if(!!match) {
        path = 'https://api.github.com/repos/' + match[1] + '/' + match[2] +  '/issues?filter=all&per_page=100';
        getIssue(null);
    }

    function getIssue(token) {
        var ajax_attr = {
            'url': path,
            'dataType': 'json',
            'type': 'GET',
            'success': createTable,
            'error': createTokenForm,
            'beforeSend': function(xhr) {
                var localToken = token || localStorage['github-token'];
                if(!!localToken) {
                    xhr.setRequestHeader('Authorization', 'token ' + localToken);
                    localStorage['github-token'] = localToken;
                }
            }
        };
        $.ajax(ajax_attr);
    }

    function createTokenForm(xhr) {
        console.log(xhr);
        $('#github-assignees-table').remove();
        var $div = createGithubAssigneesDiv();
        var input_string =  '<label for="github-assignees-token">Token:</label><input type="text" name="token" id="github-assignees-token" /><br />'
                + '<button id="github-assignees-button">Get Assignees</button>';
        $('body').append($div.append('<p>Authentication is required!</p>' + input_string));
        $('#github-assignees-button').on('click', function() {
            var token = $('#github-assignees-token').val();
            getIssue(token);
        });
    }

    function createTable(data, dataType, xhr) {
        $('#github-assignees-table').remove();
        data.filter(function(single) {
            return single.assignee && single.assignee.login;
        }).map(function(single) {
            return single.assignee;
        }).reduce(function(prev, curr) {
            if(prev.user_name.some(function(elem) { return elem == curr.login; })) {
                prev.details[prev.user_name.indexOf(curr.login)].count++;
            } else{
                prev.details.push({
                    'assignee': curr,
                    'count': 1
                });
                prev.user_name.push(curr.login);
            }
            return prev;
        }, assignees);
        var match = re_link.exec(xhr.getResponseHeader('Link'));
        if(!!match) {
            path = match[1];
            return getIssue(null);
        }
        var $table = createTableTag();
        for(var i = 0, len = assignees.details.length; i < len; i++) {
            $table.append(createTr(assignees.details[i]));
        }
        var $div = createGithubAssigneesDiv();
        $div.append($table);
        $('body').append($div);
        return 0;
    }

    function createTableTag() {
        return $('<table>')
            .css({'border': '1px #000 solid'})
            .append('<tr><th>avatar</th><th>user</th><th>count</th></tr>');
    }

    function createTr(a) {
        var $avatar = $('<img>');
        $avatar
            .attr('alt', a.assignee.login)
            .attr('width', 16)
            .attr('height', 16)
            .attr('src', a.assignee.avatar_url);
        var $avatar_td = $('<td>')
                .append($avatar)
                .attr('align', 'center');
        return $('<tr>')
            .append($avatar_td)
            .append($('<td>' + a.assignee.login + '</td>').attr('align', 'center'))
            .append($('<td>' + a.count + '</td>').attr('align', 'center'));
    }

    function createGithubAssigneesDiv() {
        return $('<div>')
            .attr('id', 'github-assignees-table')
            .css({
                'position': 'fixed',
                'top': '50px',
                'left': '0px',
                'margin': '10px'
            });
    }
});
