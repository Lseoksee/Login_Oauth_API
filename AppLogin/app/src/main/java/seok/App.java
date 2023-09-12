package seok;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;

import org.json.JSONObject;

import java.awt.Desktop;
import java.awt.FlowLayout;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;

public class App {
    public static void main(String[] args) {
        new App().start();
    }

    public void start() {
        JFrame fr = new JFrame("App");
        JButton b1 = new JButton("로그인");
        JLabel namelabel = new JLabel("로그인 해주세요");

        b1.addActionListener((e) -> {
            try {
                Desktop.getDesktop().browse(new URI("http://localhost/login/google"));
                ServerSocket socket = new ServerSocket(25565);
                socket.setSoTimeout(120000);
                // 만일 사용자가 로그인 하지 않고 페이지를 종료할경우 무한루프에 빠지므로 timeout 설정
                
                Socket sc = socket.accept();

                // 클라이언트가 응답이 종료될 수 있도록 데이터를 보내줘여함
                String messge = "클라이언트 연결";
                OutputStream os = sc.getOutputStream();
                os.write(messge.getBytes("utf-8"));
                os.flush();

                String clientmessge = new String(sc.getInputStream().readAllBytes(), "utf-8");
                JSONObject json = new JSONObject(clientmessge);
                System.out.println(json.toString());

                if (!json.isNull("err")) {
                    System.out.println(json.getString("err"));
                } else {
                    String name = json.getString("family_name")+json.getString("given_name");
                    namelabel.setText(name);
                }

                os.close();
                socket.close();
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        });

        fr.setSize(300, 400); // (프레임크기-객체크기)*
        fr.setResizable(false);
        fr.setLocationRelativeTo(null);
        fr.setFocusable(true);
        // 종료 이벤트
        fr.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent we) {
                try {
                    we.getWindow().setVisible(false);
                    we.getWindow().dispose();
                    System.exit(0);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        FlowLayout fl = new FlowLayout(FlowLayout.CENTER);
        fr.setLayout(fl);

        fr.add(b1);
        fr.add(namelabel);
        fr.setVisible(true);
        
    }
}
