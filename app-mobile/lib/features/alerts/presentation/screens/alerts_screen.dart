import 'package:flutter/material.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alerts'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // TODO: Display list of alerts with real-time updates
          ListTile(
            leading: const Icon(Icons.warning, color: Colors.red),
            title: const Text('SOS - Fisherman Name'),
            subtitle: const Text('Immersion detected'),
            trailing: const Text('2 min ago'),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
