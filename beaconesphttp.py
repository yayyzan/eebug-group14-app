from machine import Pin, ADC, PWM
import network
import socket
import time
import _thread

#gay eee  thread
def core1_thread():
    global chargestate
    global wantedbeacon
    vret_pin = ADC(Pin(26))
    vout_pin = ADC(Pin(28))
    vin_pin = ADC(Pin(27))
    pwm = PWM(Pin(0))
    pwm.freq(100000)
    pwm_en = Pin(1, Pin.OUT)

    count = 0
    pwm_out = 0
    pwm_ref = 0
    setpoint = 0.0
    delta = 0.05

    def saturate(duty):
        if duty > 62500:
            duty = 62500
        if duty < 100:
            duty = 100
        return duty

        
    pwm_ref = 5000
    pwm_out = saturate(pwm_ref)
    pwm.duty_u16(pwm_out)

    while True:#wantedbeacon
        
        pwm_en.value(1)

        vin = vin_pin.read_u16()
        vout = vout_pin.read_u16()
        vret = vret_pin.read_u16()
        count = count + 1
        
        current = (vret*3.3)/65535
        
        voutreal = (vout*5.016*3.3)/65535
        vinreal = (vin*5.016*3.3)/65535
        if voutreal > 3:
            currentlimit = 0.1
            pwm_out = pwm_out - 10
            pwm_out = saturate(pwm_out)
        elif wantedbeacon==True:
            if vinreal < 5:
                chargestate="not charged"
                currentlimit = 0
                pwm_out = saturate(0)
            else:        
                if vinreal > 10:
                    chargestate="Fully charged"
                    currentlimit = 0.1
                    oc = current - currentlimit
                    if oc > 0 :
                       pwm_out = pwm_out - 5
                       pwm_out = saturate(pwm_out)
                    else:
                       pwm_out = pwm_out + 5
                       pwm_out = saturate(pwm_out)
                else:#  12 < vinreal and vinreal > 5:
                    chargestate="semi charged"
                    currentlimit = (vinreal*0.25)/30
                    oc = current - currentlimit
                    if  oc > 0 :
                        pwm_out= pwm_out - 5
                        pwm_out = saturate(pwm_out)
                    else:
                        pwm_out= pwm_out + 5
                        pwm_out = saturate(pwm_out)
        elif wantedbeacon==False:
            currentlimit = 0
            pwm_out = saturate(0)
        pwm.duty_u16(pwm_out)    
        


#server thread   
def core0_thread():
    global chargestate
    global wantedbeacon
    ##server setup
    ssid = 'PixelJ'
    password = '12345678'

    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)

    max_wait = 10
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            print("wlan status=: "+str(wlan.status()))
            break
        max_wait -= 1
        print(max_wait)
        print('waiting for connection...')
        time.sleep(1)

    if wlan.status() != 3:
        print("gay")
        raise RuntimeError('network connection failed')
    else:
        print('connected')
        status = wlan.ifconfig()
        print( 'ip = ' + status[0] )

    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

    s = socket.socket()
    s.bind(addr)
    s.listen(1)

    print('listening on', addr)

    while True:
        try:
            cl, addr = s.accept()
            print('ok')
            print('client connected from', addr)
            request = cl.recv(1024)
            print(request)

            request = str(request)
            beacon_on = request.find('/beacon/on')
            beacon_off = request.find('/beacon/off')
            print( 'beacon on = ' + str(beacon_on))
            print( 'beacon off = ' + str(beacon_off))

            if beacon_on == 6:
                print("beacon on")
                wantedbeacon=True

            if beacon_off == 6:
                print("beacon off")
                wantedbeacon=False

            response = chargestate
            cl.send('HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n')
            cl.send(response)
            cl.close()

        except OSError as e:
        #print('connection closed')
            continue


chargestate="not charged"
wantedbeacon=False #default state for beacons off
eee_thread=_thread.start_new_thread(core1_thread,())#spawn eee thread
core0_thread() #call server thread


