from eNMS import db
from eNMS.admin.models import TacacsServer, User
from eNMS.base.helpers import retrieve
from eNMS.logs.models import Log
from tests.test_base import check_blueprints


@check_blueprints('', '/admin')
def test_user_management(user_client):
    for user in ('user1', 'user2', 'user3'):
        dict_user = {
            'name': user,
            'email': f'{user}@test.com',
            'permissions': ['Admin'],
            'password': user,
        }
        user_client.post('/admin/process_user', data=dict_user)
    assert len(User.query.all()) == 4
    user1 = retrieve(User, name='user1')
    user_client.post('/admin/delete/{}'.format(user1.id))
    assert len(User.query.all()) == 3


@check_blueprints('', '/admin')
def test_tacacs_configuration(user_client):
    tacacs_server = {
        'ip_address': '192.168.1.2',
        'password': 'test',
        'port': '49',
        'timeout': '10'
    }
    user_client.post('/admin/save_tacacs_server', data=tacacs_server)
    assert len(TacacsServer.query.all()) == 1


log1 = ('<189>19: *May  5 05:26:27.523: %LINEPROTO-5-UPDOWN: Line protocol on'
        'Interface FastEthernet0/0, changed state to up')
log2 = ('<189>20: *May  5 05:26:30.275: %LINEPROTO-5-UPDOWN: Line protocol on'
        'Interface FastEthernet0/0, changed state to down')


@check_blueprints('', '/logs')
def test_create_logs(user_client):
    for log in (log1, log2):
        log_object = Log('192.168.1.88', log)
        db.session.add(log_object)
        db.session.commit()
    assert len(Log.query.all()) == 2