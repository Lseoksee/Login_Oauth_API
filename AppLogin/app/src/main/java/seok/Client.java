package seok;

import java.io.OutputStream;
import java.net.Socket;

public class Client {
    public static void main(String[] args) {
        try {
            Socket sc = new Socket("localhost", 25565);

            OutputStream os = sc.getOutputStream();

            os.write("안녕하세요".getBytes("utf-8"));
            os.flush();
            os.close();
            sc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        


    }   
}
