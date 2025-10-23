import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionnaire de mots de passe</Text>
      <Text style={styles.subtitle}>
        Sécurisez et gérez vos mots de passe en toute simplicité
      </Text>

      <Link href="/vault" asChild>
        <TouchableOpacity style={styles.primaryButton}>
          <FontAwesome name="lock" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Ouvrir mon coffre</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/add" asChild>
        <TouchableOpacity style={styles.primaryButton}>
          <FontAwesome name="plus-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Ajouter un mot de passe</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/settings" asChild>
        <TouchableOpacity style={styles.secondaryButton}>
          <FontAwesome name="cog" size={22} color="#4B5563" />
          <Text style={styles.secondaryButtonText}>Paramètres</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 32,
    textAlign: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFF",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#4B5563",
    marginLeft: 8,
    fontSize: 16,
  },
});