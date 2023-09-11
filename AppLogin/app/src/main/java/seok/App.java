package seok;

import javax.swing.JButton;
import javax.swing.JFrame;

import java.awt.Desktop;
import java.awt.FlowLayout;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;

public class App  {
    public static void main(String[] args) {
        new App().start();
    }

    public void start() {
        JFrame fr = new JFrame("App");
        JButton b1 = new JButton("로그인");

        b1.addActionListener((e) -> {
            try {
                Desktop.getDesktop().browse(new URI("http://localhost/login/google"));

                ServerSocket socket = new ServerSocket(25565);
                
                Socket sc = socket.accept();

                String res = new String(sc.getInputStream().readAllBytes(), "utf-8");
                System.out.println(res);

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

        fr.setVisible(true);
        fr.add(b1);
    }
}
